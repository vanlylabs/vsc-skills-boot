(function () {
    console.log('[SkillsBoot] home.js initializing...');
    const vscode = acquireVsCodeApi();
    console.log('[SkillsBoot] vscode API acquired:', !!vscode);

    // Elements - Pages
    const homePage = document.getElementById('home-page');
    const createPage = document.getElementById('create-page');

    // Elements - Home
    const instructionList = document.getElementById('instruction-list');
    const btnGoToCreate = document.getElementById('go-to-create');
    const btnGoToImport = document.getElementById('go-to-import');

    // Elements - Create Form
    const btnBackToHome = document.getElementById('back-to-home');
    const btnSave = document.getElementById('save-instruction');
    const inputName = document.getElementById('inst-name');
    const inputDesc = document.getElementById('inst-desc');
    const nameError = document.getElementById('name-error');
    const selectType = document.getElementById('inst-type');
    const typeContainer = document.getElementById('type-container'); // Added container reference
    const mappingContainer = document.getElementById('mapping-container');
    const multiSelectMapping = document.getElementById('inst-mapping');
    const createErrorBanner = document.getElementById('create-error-banner');
    const formTitle = document.getElementById('form-title');
    const saveButtonText = document.getElementById('save-button-text');
    const creationGuidance = document.getElementById('creation-guidance');

    // Global state
    let toolConfigs = [];
    let currentInstructions = [];
    let formMode = 'create'; // 'create' | 'edit' | 'duplicate' | 'import'
    let editingInstructionId = null; // For edit mode
    let agentLock = null; // { enabled: true, toolId: 'claudecode' } or null

    // 1. Initial Data Request
    vscode.postMessage({ type: 'requestData' });

    // 2. Form Management Functions
    function getFormTitle(mode) {
        const titles = {
            'create': 'Initialize New Instruction',
            'edit': 'Edit Instruction',
            'duplicate': 'Duplicate Instruction',
            'import': 'Import Existing Instruction'
        };
        return titles[mode] || titles['create'];
    }

    function getSaveButtonText(mode) {
        const texts = {
            'create': 'Create & Apply Instruction',
            'edit': 'Save Changes',
            'duplicate': 'Create Duplicate',
            'import': 'Import Instruction'
        };
        return texts[mode] || texts['create'];
    }

    function openForm(mode, data = {}) {
        console.log('[SkillsBoot] Opening form in mode:', mode, 'with data:', data);
        formMode = mode;
        editingInstructionId = data.id || null;

        // Update UI
        formTitle.textContent = getFormTitle(mode);
        saveButtonText.textContent = getSaveButtonText(mode);

        // Reset and populate form
        resetCreateForm(mode, data.id || null);
        if (data.name || data.description || data.toolId) {
            populateForm(data);
        }

        // For import mode, detect instructions
        if (mode === 'import') {
            vscode.postMessage({ type: 'detectInstructions' });
        }

        // Show form page
        homePage.classList.add('hidden');
        createPage.classList.remove('hidden');

        // Toggle visibility of tool/mapping fields
        if (mode === 'create') {
            if (agentLock && agentLock.enabled) {
                // If agent lock is enabled, auto-select the locked tool
                typeContainer.classList.add('hidden');
                selectType.value = agentLock.toolId;
                const tool = toolConfigs.find(t => t.id === agentLock.toolId);
                if (tool && tool.features) {
                    renderFeatures(tool.features);
                    mappingContainer.classList.remove('hidden');
                }
            } else {
                typeContainer.classList.remove('hidden');
            }
            creationGuidance.classList.remove('hidden');
        } else {
            typeContainer.classList.add('hidden');
            mappingContainer.classList.add('hidden');
            creationGuidance.classList.add('hidden');
        }

        validateForm();
    }

    function populateForm(data) {
        if (data.name) inputName.value = data.name;
        if (data.description) inputDesc.value = data.description;
        if (data.toolId) {
            selectType.value = data.toolId;
            const tool = toolConfigs.find(t => t.id === data.toolId);
            if (tool && tool.features && formMode === 'create') {
                renderFeatures(tool.features);
                mappingContainer.classList.remove('hidden');
            }
        }
        validateForm();
    }

    function showHomePage() {
        createPage.classList.add('hidden');
        homePage.classList.remove('hidden');
        resetCreateForm();
    }

    function resetCreateForm(mode = 'create', id = null) {
        inputName.value = '';
        inputDesc.value = '';
        selectType.value = '';
        mappingContainer.classList.add('hidden');
        createErrorBanner.style.display = 'none';
        nameError.style.display = 'none';
        btnSave.disabled = true;
        creationGuidance.classList.add('hidden');
        formMode = mode;
        editingInstructionId = id;
    }

    function showCreateError(message) {
        createErrorBanner.textContent = message;
        createErrorBanner.style.display = 'block';
    }

    btnGoToCreate.addEventListener('click', () => openForm('create'));
    btnGoToImport.addEventListener('click', () => openForm('import'));

    btnBackToHome.addEventListener('click', (e) => {
        e.preventDefault(); // Handle if it's an anchor tag
        showHomePage();
    });

    // 3. Form Logic
    function validateForm() {
        const name = inputName.value.trim();
        const toolId = selectType.value;
        const nameRegex = /^[a-zA-Z0-9\-_]+$/;

        const isNameValid = nameRegex.test(name);
        nameError.style.display = (name && !isNameValid) ? 'block' : 'none';

        // Clear creation error when user fixes the name
        createErrorBanner.style.display = 'none';

        // Validate Tool ID only for create/import modes
        // In dedicated agent mode, tool is auto-selected so always valid
        let isToolValid = true;
        if (formMode === 'create' || formMode === 'import') {
            if (agentLock && agentLock.enabled) {
                isToolValid = true; // Tool is auto-set from lock
            } else {
                isToolValid = !!toolId;
            }
        }

        btnSave.disabled = !name || !isNameValid || !isToolValid;
    }

    inputName.addEventListener('input', validateForm);

    selectType.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const tool = toolConfigs.find(t => t.id === selectedId);

        if (tool && tool.features && formMode === 'create') {
            renderFeatures(tool.features);
            mappingContainer.classList.remove('hidden');
        } else {
            mappingContainer.classList.add('hidden');
        }
        validateForm();
    });

    btnSave.addEventListener('click', () => {
        const name = inputName.value.trim();
        const description = inputDesc.value.trim();
        const toolId = selectType.value;

        if (!name) return;
        if ((formMode === 'create' || formMode === 'import') && !toolId) return;

        const selectedFeatures = multiSelectMapping.value || [];

        console.log('[SkillsBoot] Save button clicked, mode:', formMode);

        switch (formMode) {
            case 'create':
                vscode.postMessage({
                    type: 'create',
                    name,
                    description,
                    toolId,
                    features: selectedFeatures
                });
                break;
            case 'edit':
                vscode.postMessage({
                    type: 'edit',
                    id: editingInstructionId,
                    name,
                    description
                });
                break;
            case 'duplicate':
                vscode.postMessage({
                    type: 'duplicate',
                    sourceId: editingInstructionId,
                    name,
                    description
                });
                break;
            case 'import':
                vscode.postMessage({
                    type: 'import',
                    name,
                    description,
                    toolId,
                    features: selectedFeatures
                });
                break;
        }

        // DO NOT showHomePage() here. 
        // We stay on the page until we get an 'update' (success) or 'createError' (failure).
    });

    document.getElementById('agent-lock-select').addEventListener('change', (e) => {
        const toolId = e.target.value;
        if (toolId) {
            vscode.postMessage({ type: 'setAgentLock', toolId });
        } else {
            vscode.postMessage({ type: 'setAgentLock', toolId: null });
        }
    });

    // 4. Event Delegation for Action Buttons (set up once)
    console.log('[SkillsBoot] Setting up action button event delegation on:', instructionList);

    // Edit button handler
    instructionList.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
            const instructionId = editBtn.dataset.instructionId;
            const instructionName = editBtn.dataset.instructionName;
            const instructionDesc = editBtn.dataset.instructionDesc;
            console.log('[SkillsBoot] Edit button clicked for:', instructionId);
            e.stopPropagation();
            e.preventDefault();
            openForm('edit', {
                id: instructionId,
                name: instructionName,
                description: instructionDesc
            });
        }
    });

    // Duplicate button handler
    instructionList.addEventListener('click', (e) => {
        const duplicateBtn = e.target.closest('.btn-duplicate');
        if (duplicateBtn) {
            const instructionId = duplicateBtn.dataset.instructionId;
            const instructionName = duplicateBtn.dataset.instructionName;
            const instructionDesc = duplicateBtn.dataset.instructionDesc;
            console.log('[SkillsBoot] Duplicate button clicked for:', instructionId);
            e.stopPropagation();
            e.preventDefault();
            openForm('duplicate', {
                id: instructionId,
                name: instructionName + '-copy',
                description: instructionDesc
            });
        }
    });

    // Delete button handler
    console.log('[SkillsBoot] Setting up delete button event delegation on:', instructionList);
    instructionList.addEventListener('click', (e) => {
        console.log('[SkillsBoot] instructionList clicked, target:', e.target);
        const removeBtn = e.target.closest('.btn-remove');
        console.log('[SkillsBoot] Closest remove-btn:', removeBtn);
        if (removeBtn) {
            const instructionId = removeBtn.dataset.instructionId;
            const instructionName = removeBtn.dataset.instructionName;
            console.log('[SkillsBoot] Delete button clicked for:', instructionId, 'name:', instructionName);
            e.stopPropagation();
            e.preventDefault();

            // Note: confirm() doesn't work in sandboxed webviews
            // Confirmation will be handled by the extension backend
            console.log('[SkillsBoot] Posting delete message to extension');
            vscode.postMessage({ type: 'delete', id: instructionId });
            console.log('[SkillsBoot] Delete message posted');
        }
    });
    console.log('[SkillsBoot] Delete button event delegation set up complete');

    // 5. Message Handling
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'update':
                toolConfigs = message.availableTools || [];
                currentInstructions = message.instructions || [];
                agentLock = message.agentLock || null;

                if (agentLock && agentLock.enabled) {
                    document.getElementById('agent-lock-select').value = agentLock.toolId;
                } else {
                    document.getElementById('agent-lock-select').value = '';
                }

                updateToolDropdown(toolConfigs);
                renderInstructions(
                    currentInstructions,
                    message.selected,
                    message.availableTools
                );

                // If we were on the create page, go back home now that it's finished
                if (!createPage.classList.contains('hidden')) {
                    showHomePage();
                }
                break;
            case 'detected':
                console.log('[SkillsBoot] Detected:', message);
                if (message.toolId) {
                    selectType.value = message.toolId;
                    const tool = toolConfigs.find(t => t.id === message.toolId);
                    if (tool && tool.features && formMode === 'create') {
                        renderFeatures(tool.features);
                        mappingContainer.classList.remove('hidden');
                    }
                }
                validateForm();
                break;
            case 'createError':
                showCreateError(message.message);
                break;
            case 'detectionFailed':
                showCreateError("No recognizable instruction found in current project.");
                btnSave.disabled = true;
                selectType.value = '';
                break;
        }
    });

    // 5. Rendering & Component Logic
    function updateToolDropdown(tools) {
        selectType.innerHTML = '<option value="">Select a tool...</option>';
        const lockSelect = document.getElementById('agent-lock-select');
        lockSelect.innerHTML = '<option value="">Off</option>';

        tools.forEach(tool => {
            const opt = document.createElement('option');
            opt.value = tool.id;
            opt.textContent = tool.displayName;
            selectType.appendChild(opt);

            const optLock = document.createElement('option');
            optLock.value = tool.id;
            optLock.textContent = tool.displayName;
            lockSelect.appendChild(optLock);
        });

        // Restore lock selection after repopulating
        if (agentLock && agentLock.enabled) {
            lockSelect.value = agentLock.toolId;
        }
    }

    function renderFeatures(features) {
        multiSelectMapping.innerHTML = '';
        features.forEach(f => {
            const opt = document.createElement('vscode-option');
            opt.value = f;
            opt.textContent = f;
            opt.selected = true;
            multiSelectMapping.appendChild(opt);
        });
    }


    /**
     * Renders the list of instructions cards.
     * Uses event delegation for the tool selectors.
     */
    function renderInstructions(instructions, selectedState, availableTools) {
        if (!instructionList) return;
        instructionList.innerHTML = '';

        if (instructions.length === 0) {
            instructionList.innerHTML = `
                <div class="empty-state">
                    <h3>No Instructions Found</h3>
                    <p>Initialize a new instruction to get started.</p>
                </div>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        instructions.forEach(inst => {
            const isActive = selectedState && inst.id === selectedState.id;
            const card = document.createElement('div');
            card.className = `instruction-card ${isActive ? 'active' : ''}`;

            // Safe Text Content
            const name = inst.name || 'Unnamed';
            const desc = inst.description || 'No description provided';

            const toolSelectorId = `tool-select-${inst.id}`;
            const linkedToolId = isActive ? selectedState.toolId : null;

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title">
                        <span class="codicon codicon-chevron-right"></span>
                        <span class="codicon codicon-beaker"></span>
                        <span class="inst-name"></span>
                    </div>
                    ${isActive
                    ? '<span class="badge linked">Active</span>'
                    : '<span class="badge">Inactive</span>'}
                </div>
                <div class="card-desc"></div>
                <div class="card-actions">
                    ${agentLock?.enabled ? `
                        <vscode-button appearance="${(isActive && selectedState.toolId === agentLock.toolId) ? 'primary' : 'secondary'}" class="btn-apply-toggle ${(isActive && selectedState.toolId === agentLock.toolId) ? 'applied' : ''}" data-instruction-id="${inst.id}">
                            ${(isActive && selectedState.toolId === agentLock.toolId) ? 'Remove' : 'Apply'}
                        </vscode-button>
                    ` : `
                        <select id="${toolSelectorId}" class="tool-selector">
                            <option value="unlinked" ${!isActive ? 'selected' : ''}>None</option>
                        </select>
                    `}
                    <button class="icon-btn btn-edit" data-instruction-id="${inst.id}" data-instruction-name="${name}" data-instruction-desc="${desc}" title="Edit this instruction">
                        ✎
                    </button>
                    <button class="icon-btn btn-duplicate" data-instruction-id="${inst.id}" data-instruction-name="${name}" data-instruction-desc="${desc}" title="Duplicate this instruction">
                        ⎘
                    </button>
                    <button class="icon-btn btn-remove" data-instruction-id="${inst.id}" data-instruction-name="${name}" title="Delete this instruction">
                        ×
                    </button>
                </div>
            `;

            // inject text content safely
            card.querySelector('.inst-name').textContent = name;
            card.querySelector('.card-desc').textContent = desc;

            // Expand/Collapse Logic
            const header = card.querySelector('.card-header');
            const toggleExpand = () => card.classList.toggle('expanded');

            header.addEventListener('click', (e) => {
                // Ignore clicks on the badge
                if (e.target.closest('.badge')) return;
                toggleExpand();
            });

            // Also allow clicking the description to expand
            const descEl = card.querySelector('.card-desc');
            descEl.addEventListener('click', toggleExpand);

            if (agentLock?.enabled) {
                const applyBtn = card.querySelector('.btn-apply-toggle');
                applyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (applyBtn.classList.contains('applied')) {
                        vscode.postMessage({ type: 'unlink', id: inst.id });
                    } else {
                        vscode.postMessage({ type: 'applyLocked', id: inst.id });
                    }
                });
            } else {
                // Populate the dropdown
                const select = card.querySelector('.tool-selector');
                availableTools.forEach(tool => {
                    const opt = document.createElement('option');
                    opt.value = tool.id;
                    opt.textContent = tool.displayName;
                    if (linkedToolId === tool.id) opt.selected = true;
                    select.appendChild(opt);
                });

                select.addEventListener('change', (e) => {
                    const val = e.target.value;
                    handleToolChange(inst.id, val);
                });
            }

            fragment.appendChild(card);
        });

        instructionList.appendChild(fragment);
    }

    function handleToolChange(instructionId, toolId) {
        if (toolId === 'unlinked') {
            vscode.postMessage({ type: 'unlink', id: instructionId });
        } else {
            vscode.postMessage({
                type: 'apply',
                id: instructionId,
                toolId: toolId
            });
        }
    }

}());
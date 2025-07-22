/**
 * Process Management System - Frontend JavaScript
 * Handles all frontend-backend communication and UI interactions
 */

class ProcessManager {
    constructor() {
        this.apiBase = '/api.php';
        this.currentProcessId = null;
        this.processes = [];
        
        this.initializeEventListeners();
        this.loadProcesses();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Modal controls
        document.getElementById('addProcessBtn').addEventListener('click', () => this.openModal());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.searchProcesses());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchProcesses();
        });
        
        // Form submission
        document.getElementById('processForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Modal overlay click to close
        document.getElementById('processModal').addEventListener('click', (e) => {
            if (e.target.id === 'processModal') this.closeModal();
        });
    }

    // Load all processes from API
    async loadProcesses(search = '') {
        try {
            const url = search ? `${this.apiBase}/processes?search=${encodeURIComponent(search)}` : `${this.apiBase}/processes`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.processes = await response.json();
            this.renderProcesses();
        } catch (error) {
            console.error('Error loading processes:', error);
            this.showError('Erro ao carregar processos. Verifique a conexão.');
        }
    }

    // Render processes in the list
    renderProcesses() {
        const listContainer = document.getElementById('processList');
        
        if (this.processes.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum processo encontrado</h3>
                    <p>Clique em "Novo Processo" para começar</p>
                </div>
            `;
            return;
        }

        const processesHtml = this.processes.map(process => `
            <div class="process-card" data-id="${process.id}">
                <div class="process-header">
                    <h3>${process.numero}</h3>
                    <span class="status-badge status-${process.status.toLowerCase().replace(' ', '-')}">${process.status}</span>
                </div>
                <div class="process-body">
                    <p><strong>Nome:</strong> ${process.nome}</p>
                    ${process.email ? `<p><strong>Email:</strong> ${process.email}</p>` : ''}
                    ${process.telefone ? `<p><strong>Telefone:</strong> ${process.telefone}</p>` : ''}
                    ${process.tipo ? `<p><strong>Tipo:</strong> ${process.tipo}</p>` : ''}
                    ${process.observacoes ? `<p><strong>Observações:</strong> ${process.observacoes}</p>` : ''}
                </div>
                <div class="process-footer">
                    <small>Criado: ${this.formatDate(process.data_criacao)}</small>
                    <div class="process-actions">
                        <button class="btn btn-small btn-secondary" onclick="processManager.editProcess(${process.id})">✏️ Editar</button>
                        <button class="btn btn-small btn-danger" onclick="processManager.deleteProcess(${process.id})">🗑️ Excluir</button>
                    </div>
                </div>
            </div>
        `).join('');

        listContainer.innerHTML = processesHtml;
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Open modal for adding/editing process
    openModal(processId = null) {
        this.currentProcessId = processId;
        const modal = document.getElementById('processModal');
        const form = document.getElementById('processForm');
        const title = document.getElementById('modalTitle');
        
        form.reset();
        
        if (processId) {
            title.textContent = 'Editar Processo';
            this.loadProcessForEdit(processId);
        } else {
            title.textContent = 'Novo Processo';
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('processModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentProcessId = null;
    }

    // Load process data for editing
    async loadProcessForEdit(processId) {
        try {
            const response = await fetch(`${this.apiBase}/processes/${processId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const process = await response.json();
            
            // Fill form with process data
            document.getElementById('numero').value = process.numero || '';
            document.getElementById('nome').value = process.nome || '';
            document.getElementById('email').value = process.email || '';
            document.getElementById('telefone').value = process.telefone || '';
            document.getElementById('tipo').value = process.tipo || '';
            document.getElementById('status').value = process.status || 'Em Andamento';
            document.getElementById('observacoes').value = process.observacoes || '';
            
        } catch (error) {
            console.error('Error loading process for edit:', error);
            this.showError('Erro ao carregar dados do processo.');
        }
    }

    // Handle form submission
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const processData = {};
        
        for (let [key, value] of formData.entries()) {
            processData[key] = value;
        }

        try {
            let response;
            
            if (this.currentProcessId) {
                // Update existing process
                response = await fetch(`${this.apiBase}/processes/${this.currentProcessId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(processData)
                });
            } else {
                // Create new process
                response = await fetch(`${this.apiBase}/processes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(processData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar processo');
            }

            this.showSuccess(this.currentProcessId ? 'Processo atualizado com sucesso!' : 'Processo criado com sucesso!');
            this.closeModal();
            this.loadProcesses();
            
        } catch (error) {
            console.error('Error saving process:', error);
            this.showError(error.message);
        }
    }

    // Edit process
    editProcess(processId) {
        this.openModal(processId);
    }

    // Delete process
    async deleteProcess(processId) {
        if (!confirm('Tem certeza que deseja excluir este processo?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/processes/${processId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir processo');
            }

            this.showSuccess('Processo excluído com sucesso!');
            this.loadProcesses();
            
        } catch (error) {
            console.error('Error deleting process:', error);
            this.showError('Erro ao excluir processo.');
        }
    }

    // Search processes
    async searchProcesses() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        await this.loadProcesses(searchTerm);
    }

    // Show success message
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showMessage(message, 'error');
    }

    // Show message (success or error)
    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;

        // Insert at top of container
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.processManager = new ProcessManager();
});
// Função para listar os usuários
async function listarUsuarios() {
    // Obter o token do localStorage
    const token = localStorage.getItem('token');
    const userIdLogado = localStorage.getItem('userId');

    try {
        if (token) {
            // Fazer uma requisição para a API protegida para obter os dados do usuário
            const response = await fetch('http://localhost:8000/api/user/listar', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });            
    
            if (response.ok) {
                const usuarios = await response.json();
    
                // Seleciona o corpo da tabela
                const tabelaUsuarios = document.getElementById('tabelaUsuarios');
                tabelaUsuarios.innerHTML = ''; // Limpa a tabela
    
                // Itera sobre os usuários e adiciona cada um à tabela
                usuarios.user.data.forEach((usuario, index) => {
                    
                    const dataCriacao = new Date(usuario.created_at);
                    const dataFormatada = dataCriacao.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false // Formato 24 horas
                    });
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${usuario.name}</td>
                        <td>${usuario.email}</td>
                        <td>${dataFormatada}</td>
                        <td>
                            <button class="btn btn-info btn-sm visualizarOUsuario" data-id="${usuario.id}">
                                <i class="fas fa-eye"></i>
                            </button>

                            <button class="btn btn-info btn-sm editarOUsuario" data-id="${usuario.id}">
                                <i class="fas fa-pencil"></i>
                            </button>
                            ${
                                usuario.id != userIdLogado
                                ? `<button class="btn btn-danger btn-sm excluir-usuario" data-id="${usuario.id}">
                                    <i class="fas fa-trash-alt"></i>
                                   </button>`
                                : ''
                            } <!-- Mostra o botão de excluir apenas se o id for diferente -->
                        </td>
                    `;
                    tabelaUsuarios.appendChild(row);
                    
                });

                // Adiciona o evento de clique para excluir o usuário
                document.querySelectorAll('.excluir-usuario').forEach(button => {
                    button.addEventListener('click', async function() {
                        const userId = this.getAttribute('data-id');
                        const confirmar = confirm('Tem certeza que deseja excluir este usuário?');
                        if (confirmar) {
                            await excluirUsuario(userId);
                        }
                    });
                });
              
                document.querySelectorAll('.visualizarOUsuario').forEach(button => {
                    button.addEventListener('click', function() {
                        const userId = this.getAttribute('data-id');
                        visualizarUsuario(userId);
                    });
                });



// Aqui vai ser adicionado a a parte tanto de atualizar quanto de editar da mesma forma que foi feito acima
                document.querySelectorAll('.atualizar-usuario').forEach(button => {
                    button.addEventListener('click', function() {
                        atualizarUsuario();//atualiza pelo método que já foi criado
                    });
                });

                document.querySelectorAll('.editarOUsuario').forEach(button => {
                    button.addEventListener('click', function() {
                        const userId = this.getAttribute('data-id');
                        editarUsuario(userId);
                    });
                });

            } else {
                throw new Error('Usuário não encontrado, verifique o Id e tente novamente');
            }
        } else {
            // Redireciona para o login se o token não existir
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Erro:', error);
        const mensagemErro = document.getElementById('mensagemErro');
        mensagemErro.textContent = 'Erro ao carregar a lista de usuários';
        mensagemErro.classList.remove('d-none');
    }
}

// Função para excluir o usuário
async function excluirUsuario(userId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:8000/api/user/deletar/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            alert('Usuário excluído com sucesso!');
            listarUsuarios(); // Recarregar a lista de usuários
        } else {
            throw new Error('Erro ao excluir o usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir o usuário.');
    }
}
 
function visualizarUsuario(userId) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8000/api/user/visualizar/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {                
        document.getElementById('usuarioNome').textContent = data.user.name;
        document.getElementById('usuarioEmail').textContent = data.user.email;

        const dataCriacao = new Date(data.user.created_at);
        document.getElementById('usuarioDataCriacao').textContent = dataCriacao.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Mostra modal
        const visualizarModal = new bootstrap.Modal(document.getElementById('visualizarUsuarioModal'));
        visualizarModal.show();
    })
    .catch(error => {
        console.error('Erro ao visualizar o usuário:', error);
    });
}


//Adicionando a função de editar o usuário de acordo com o que foi criado acima 
function editarUsuario(userId) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8000/api/user/visualizar/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {  
        document.getElementById('usuarioNomeForm').value = data.user.name;
        document.getElementById('usuarioEmailForm').value = data.user.email;
        document.getElementById('usuarioCodigoForm').value = data.user.id;

        const editarModal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'));
        editarModal.show();
    })
    .catch(error => {
        console.error('Erro ao editar o usuário:', error);
    });
}


//Criando a função de atualizar
function atualizarUsuario() {
    const token = localStorage.getItem('token');

    const userId = document.getElementById('usuarioCodigoForm').value; 
    const name = document.getElementById('usuarioNomeForm').value; 
    const email = document.getElementById('usuarioEmailForm').value; 
    const password = document.getElementById('usuarioSenhaForm').value; 
    const password_confirmation = document.getElementById('usuarioConfirmaSenhaForm').value; 

    fetch(`http://localhost:8000/api/user/atualizar/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({name:name, email:email, password: password, password_confirmation:password_confirmation})
    })
    .then(response => response.json())
    .then(data => { 
        const mensagemSucesso = document.getElementById('mensagemSucesso');
        mensagemSucesso.textContent = data.message
        mensagemSucesso.classList.remove('d-none');       
        listarUsuarios();
    })
    .catch(error => {
        console.error('Erro ao editar o usuário:', error);
        const mensagemErro = document.getElementById('mensagemErro');
        mensagemErro.textContent = 'Erro ao atualizar o usuário';
        mensagemErro.classList.remove('d-none');
    });

}

// Chama a função para listar os usuários assim que a página for carregada
document.addEventListener('DOMContentLoaded', listarUsuarios);

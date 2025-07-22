# Sistema de Processos - Little Pet

Sistema simples e funcional para gerenciamento de processos de adoção e cadastro de pets.

## 🚀 Como Usar

### Requisitos
- PHP 8.0+ (com SQLite habilitado)
- Navegador web moderno

### Instalação e Execução

1. **Baixe os arquivos** para uma pasta no seu computador

2. **Execute o servidor PHP**:
   ```bash
   php -S localhost:8000
   ```

3. **Abra seu navegador** e acesse:
   ```
   http://localhost:8000
   ```

4. **Pronto!** O sistema está funcionando 🎉

## ✨ Funcionalidades

- ✅ **Listar processos** - Visualize todos os processos cadastrados
- ✅ **Adicionar processo** - Cadastre novos processos via formulário
- ✅ **Pesquisar/filtrar** - Encontre processos por número, nome, email ou tipo
- ✅ **Editar processo** - Atualize informações de processos existentes
- ✅ **Excluir processo** - Remova processos quando necessário
- ✅ **Banco persistente** - Dados salvos automaticamente em SQLite

## 📁 Arquivos

- `index.html` - Interface principal do sistema
- `api.php` - Backend com SQLite (auto-configuração)
- `app.js` - JavaScript para interações frontend/backend
- `styles.css` - Estilos responsivos e modernos
- `processes.db` - Banco SQLite (criado automaticamente)

## 🎯 Tipos de Processo

- Adoção
- Cadastro
- Acompanhamento
- Doação
- Outros

## 📊 Status Disponíveis

- Em Andamento
- Concluído
- Pendente
- Cancelado

## 🔧 Configuração

O sistema **não precisa de configuração**! 

- O banco SQLite é criado automaticamente
- As tabelas são criadas na primeira execução
- Funciona direto após download

## 💻 Compatibilidade

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (responsivo)
- ✅ Tablet

## 📝 Campos do Processo

- **Número*** - Identificador único (obrigatório)
- **Nome*** - Nome do interessado (obrigatório)
- **Email** - Contato por email
- **Telefone** - Contato telefônico
- **Tipo** - Categoria do processo
- **Status** - Situação atual
- **Observações** - Informações adicionais

## 🆘 Solução de Problemas

### Erro "Port already in use"
```bash
# Use outra porta
php -S localhost:8001
```

### Erro de permissão no banco
```bash
# Dê permissão na pasta
chmod 755 .
chmod 666 processes.db  # (se já existir)
```

### Interface não carrega
- Verifique se o PHP está rodando
- Acesse: http://localhost:8000/index.html

## 📄 Licença

Sistema desenvolvido para fins educacionais e de demonstração.

---

**Little Pet © 2024** - Sistema de Processos Simplificado
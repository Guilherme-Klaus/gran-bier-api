using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GranBier.Api.Data;
using GranBier.Api.Models;

namespace GranBier.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClientesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/clientes (Cria um novo cliente com trava de CPF)
        [HttpPost]
        public async Task<ActionResult<Cliente>> CadastrarCliente(Cliente cliente)
        {
            // TRAVA DE SEGURANÇA: Verifica se o CPF já existe no banco
            bool cpfJaExiste = await _context.Clientes.AnyAsync(c => c.Cpf == cliente.Cpf);
            
            if (cpfJaExiste)
            {
                // Devolve um Erro 400 (Bad Request) com uma mensagem amigável
                return BadRequest(new { mensagem = "Este CPF já está cadastrado no sistema!" });
            }

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
            return Ok(cliente);
        }

        // GET: api/clientes (Busca a lista)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> ListarClientes()
        {
            var clientes = await _context.Clientes.ToListAsync();
            return Ok(clientes);
        }

        // PUT: api/clientes/5 (Atualiza um cliente existente)
        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarCliente(int id, Cliente clienteAtualizado)
        {
            if (id != clienteAtualizado.Id) return BadRequest();

            _context.Entry(clienteAtualizado).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/clientes/5 (Exclui um cliente)
        [HttpDelete("{id}")]
        public async Task<IActionResult> ExcluirCliente(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null) return NotFound();

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
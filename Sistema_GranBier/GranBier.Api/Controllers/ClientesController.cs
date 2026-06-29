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

        // O Controlador pede acesso ao Banco de Dados (Injeção de Dependência)
        public ClientesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/clientes (Cria um novo cliente)
        [HttpPost]
        public async Task<ActionResult<Cliente>> CadastrarCliente(Cliente cliente)
        {
            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();

            return Ok(cliente); // Retorna sucesso e os dados do cliente salvo
        }

        // GET: api/clientes (Busca a lista de todos os clientes)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> ListarClientes()
        {
            var clientes = await _context.Clientes.ToListAsync();
            return Ok(clientes);
        }
    }
}
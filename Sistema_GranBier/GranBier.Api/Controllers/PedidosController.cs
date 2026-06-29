using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GranBier.Api.Data;
using GranBier.Api.Models;

namespace GranBier.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PedidosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PedidosController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Pedidos (Abre um novo pedido para um evento)
        [HttpPost]
        public async Task<ActionResult<Pedido>> CriarPedido(Pedido pedido)
        {
            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();
            return Ok(pedido);
        }

        // GET: api/Pedidos (Lista todos os pedidos com os dados do cliente embutidos)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> ListarPedidos()
        {
            var pedidos = await _context.Pedidos
                                        .Include(p => p.Cliente)
                                        .Include(p => p.EquipamentosAlocados)
                                        .ToListAsync();
            return Ok(pedidos);
        }
    }
}
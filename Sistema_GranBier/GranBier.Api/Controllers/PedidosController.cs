using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GranBier.Api.Data;
using GranBier.Api.Models;
using System.Linq; 

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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> ListarPedidos()
        {
            var pedidos = await _context.Pedidos.Include(p => p.Cliente).ToListAsync();
            return Ok(pedidos);
        }

        [HttpPost]
        public async Task<ActionResult<Pedido>> CadastrarPedido(Pedido pedido)
        {
            _context.Pedidos.Add(pedido);

            if (!string.IsNullOrEmpty(pedido.EquipamentoIds))
            {
                var ids = pedido.EquipamentoIds.Split(',').Select(int.Parse).ToList();
                // CORREÇÃO: Usando 'eqId' para evitar conflito de nomes
                foreach (var eqId in ids)
                {
                    var equipamento = await _context.Equipamentos.FindAsync(eqId);
                    if (equipamento != null)
                    {
                        equipamento.Disponivel = false;
                        _context.Entry(equipamento).State = EntityState.Modified;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(pedido);
        }

        [HttpPut("{id}/concluir")]
        public async Task<IActionResult> ConcluirPedido(int id)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null) return NotFound();

            pedido.Concluido = true;

            if (!string.IsNullOrEmpty(pedido.EquipamentoIds))
            {
                var ids = pedido.EquipamentoIds.Split(',').Select(int.Parse).ToList();
                // CORREÇÃO: Usando 'eqId' aqui também pelo mesmo motivo!
                foreach (var eqId in ids)
                {
                    var equipamento = await _context.Equipamentos.FindAsync(eqId);
                    if (equipamento != null)
                    {
                        equipamento.Disponivel = true;
                        _context.Entry(equipamento).State = EntityState.Modified;
                    }
                }
            }

            _context.Entry(pedido).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> ExcluirPedido(int id)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null) return NotFound();

            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
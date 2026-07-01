using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GranBier.Api.Data;
using GranBier.Api.Models;
using System.Linq; 
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace GranBier.Api.Controllers
{
    public class ReceberSaldoDto 
    { 
        public string FormaPagamento { get; set; } = string.Empty; 
    }

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
            var ultimoPedido = await _context.Pedidos.OrderByDescending(p => p.Id).FirstOrDefaultAsync();
            int proximoId = (ultimoPedido?.Id ?? 0) + 1;
            pedido.NumeroPedido = $"#{proximoId.ToString("D5")}";

            if (pedido.ValorPagoReserva > pedido.ValorTotal)
            {
                pedido.ValorTotal = pedido.ValorPagoReserva;
            }

            pedido.SaldoAPagar = pedido.ValorTotal - pedido.ValorPagoReserva;
            
            if (pedido.SaldoAPagar < 0) pedido.SaldoAPagar = 0;
            
            if (pedido.SaldoAPagar <= 0) {
                pedido.StatusPagamento = "Totalmente Pago";
                pedido.PagamentoAberto = false;
            } else if (pedido.ValorPagoReserva > 0) {
                pedido.StatusPagamento = "Pago Parcialmente";
                pedido.PagamentoAberto = true;
            } else {
                pedido.StatusPagamento = "Aguardando Pagamento";
                pedido.PagamentoAberto = true;
            }

            _context.Pedidos.Add(pedido);

            if (!string.IsNullOrEmpty(pedido.EquipamentoIds))
            {
                var ids = pedido.EquipamentoIds.Split(',').Select(int.Parse).ToList();
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

        [HttpPut("{id}/receber-saldo")]
        public async Task<IActionResult> ReceberSaldoPendente(int id, [FromBody] ReceberSaldoDto dto)
        {
            var pedido = await _context.Pedidos.Include(p => p.Cliente).FirstOrDefaultAsync(p => p.Id == id);
            if (pedido == null) return NotFound();

            if (pedido.SaldoAPagar > 0)
            {
                // 1. Injeta o dinheiro do Saldo no Caixa
                var movimentacao = new MovimentacaoCaixa
                {
                    Descricao = $"Recebimento de Saldo - {pedido.NumeroPedido} ({pedido.Cliente?.NomeCompleto})",
                    Tipo = "Entrada",
                    Valor = pedido.SaldoAPagar,
                    Data = DateTime.Now,
                    FormaPagamento = dto.FormaPagamento
                };
                _context.MovimentacaoCaixa.Add(movimentacao);

                // 2. Zera a dívida do cliente (SEM alterar o valor original do Sinal)
                pedido.SaldoAPagar = 0;
                pedido.StatusPagamento = "Totalmente Pago";
                pedido.PagamentoAberto = false;

                _context.Entry(pedido).State = EntityState.Modified;
                await _context.SaveChangesAsync();
            }

            return NoContent();
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
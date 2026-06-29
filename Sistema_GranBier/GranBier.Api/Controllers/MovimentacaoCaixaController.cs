using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GranBier.Api.Data;
using GranBier.Api.Models;

namespace GranBier.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovimentacaoCaixaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MovimentacaoCaixaController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/MovimentacaoCaixa (Registra uma nova entrada ou saída de dinheiro)
        [HttpPost]
        public async Task<ActionResult<MovimentacaoCaixa>> RegistrarMovimentacao(MovimentacaoCaixa movimentacao)
        {
            _context.MovimentacoesCaixa.Add(movimentacao);
            await _context.SaveChangesAsync();
            return Ok(movimentacao);
        }

        // GET: api/MovimentacaoCaixa (Lista todo o extrato financeiro)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovimentacaoCaixa>>> ListarExtrato()
        {
            var extrato = await _context.MovimentacoesCaixa.ToListAsync();
            return Ok(extrato);
        }

        // GET: api/MovimentacaoCaixa/saldo (Calcula o saldo total da operação)
        [HttpGet("saldo")]
        public async Task<ActionResult> ConsultarSaldo()
        {
            var entradas = await _context.MovimentacoesCaixa
                                         .Where(m => m.IsEntrada == true)
                                         .SumAsync(m => m.Valor);
                                         
            var saidas = await _context.MovimentacoesCaixa
                                       .Where(m => m.IsEntrada == false)
                                       .SumAsync(m => m.Valor);
                                       
            var saldoFinal = entradas - saidas;
            
            // Retorna um JSON bonitinho com o resumo financeiro
            return Ok(new { 
                TotalEntradas = entradas, 
                TotalSaidas = saidas, 
                SaldoAtual = saldoFinal 
            });
        }
    }
}
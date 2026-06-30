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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovimentacaoCaixa>>> ListarMovimentacoes()
        {
            return await _context.MovimentacaoCaixa.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<MovimentacaoCaixa>> CadastrarMovimentacao(MovimentacaoCaixa movimentacao)
        {
            _context.MovimentacaoCaixa.Add(movimentacao);
            await _context.SaveChangesAsync();
            return Ok(movimentacao);
        }
    }
}
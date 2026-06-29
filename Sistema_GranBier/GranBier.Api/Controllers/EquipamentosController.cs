using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GranBier.Api.Data;
using GranBier.Api.Models;

namespace GranBier.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EquipamentosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EquipamentosController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Equipamentos (Para adicionar novas chopeiras/cilindros ao estoque)
        [HttpPost]
        public async Task<ActionResult<Equipamento>> CadastrarEquipamento(Equipamento equipamento)
        {
            _context.Equipamentos.Add(equipamento);
            await _context.SaveChangesAsync();
            return Ok(equipamento);
        }

        // GET: api/Equipamentos (Lista TODOS os equipamentos da empresa)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Equipamento>>> ListarTodos()
        {
            var equipamentos = await _context.Equipamentos.ToListAsync();
            return Ok(equipamentos);
        }

        // GET: api/Equipamentos/disponiveis (Filtra para mostrar só o que está no galpão)
        [HttpGet("disponiveis")]
        public async Task<ActionResult<IEnumerable<Equipamento>>> ListarDisponiveis()
        {
            var disponiveis = await _context.Equipamentos
                                            .Where(e => e.Disponivel == true)
                                            .ToListAsync();
            return Ok(disponiveis);
        }
    }
}
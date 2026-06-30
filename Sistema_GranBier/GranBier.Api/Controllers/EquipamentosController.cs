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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Equipamento>>> ListarTodosEquipamentos()
        {
            return await _context.Equipamentos.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Equipamento>> CadastrarEquipamento(Equipamento equipamento)
        {
            _context.Equipamentos.Add(equipamento);
            await _context.SaveChangesAsync();
            return Ok(equipamento);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> ExcluirEquipamento(int id)
        {
            var equipamento = await _context.Equipamentos.FindAsync(id);
            if (equipamento == null) return NotFound();

            _context.Equipamentos.Remove(equipamento);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
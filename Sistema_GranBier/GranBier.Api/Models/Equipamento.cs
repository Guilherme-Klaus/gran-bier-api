using System.ComponentModel.DataAnnotations;

namespace GranBier.Api.Models
{
    public class Equipamento
    {
        [Key]
        public int Id { get; set; }
        
        // NOVO: Define se é Chopeira, Cilindro, Extratora, etc.
        public string Categoria { get; set; } = "Outros"; 
        
        public string Descricao { get; set; } = string.Empty;
        public bool Disponivel { get; set; } = true;
    }
}
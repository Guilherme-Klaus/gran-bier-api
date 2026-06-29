namespace GranBier.Api.Models
{
    public class Equipamento
    {
        public int Id { get; set; }
        public string Tipo { get; set; } = string.Empty; 
        public string Descricao { get; set; } = string.Empty; 
        public bool Disponivel { get; set; } = true; 
    }
}
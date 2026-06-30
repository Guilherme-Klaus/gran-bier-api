using System.ComponentModel.DataAnnotations;

namespace GranBier.Api.Models
{
    public class Cliente
    {
        [Key]
        public int Id { get; set; }
        public string NomeCompleto { get; set; } = string.Empty;
        public string Cpf { get; set; } = string.Empty;
        public string Endereco { get; set; } = string.Empty;
        
        // NOVOS CAMPOS PARA O ENDEREÇO E OBSERVAÇÕES
        public string Numero { get; set; } = string.Empty; 
        public string Cep { get; set; } = string.Empty; 
        
        public DateTime DataNascimento { get; set; }
        public string Observacoes { get; set; } = string.Empty;
    }
}
using System.ComponentModel.DataAnnotations;

namespace GranBier.Api.Models
{
    public class Cliente
    {
        [Key]
        public int Id { get; set; }
        
        public string TipoCliente { get; set; } = "PF"; // PF ou PJ
        public string Cnpj { get; set; } = string.Empty;
        public string RazaoSocial { get; set; } = string.Empty;
        
        public string NomeCompleto { get; set; } = string.Empty;
        public string Cpf { get; set; } = string.Empty;
        public string Endereco { get; set; } = string.Empty;
        public string Numero { get; set; } = string.Empty; 
        public string Cep { get; set; } = string.Empty; 
        public DateTime DataNascimento { get; set; }
        public string Observacoes { get; set; } = string.Empty;
        
        // NOVO: Armazena o arquivo (PDF/Imagem) convertido em texto seguro
        public string DocumentoAnexo { get; set; } = string.Empty; 
    }
}
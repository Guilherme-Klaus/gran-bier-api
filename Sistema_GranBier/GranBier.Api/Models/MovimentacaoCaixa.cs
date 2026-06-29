namespace GranBier.Api.Models
{
    public enum FormaPagamento
    {
        Pix,
        CartaoCredito,
        CartaoDebito,
        Dinheiro
    }

    public class MovimentacaoCaixa
    {
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public DateTime DataHora { get; set; } = DateTime.Now;
        public bool IsEntrada { get; set; } 
        public FormaPagamento? FormaPagamento { get; set; } 
    }
}
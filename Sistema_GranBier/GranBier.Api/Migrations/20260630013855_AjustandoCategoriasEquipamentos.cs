using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GranBier.Api.Migrations
{
    /// <inheritdoc />
    public partial class AjustandoCategoriasEquipamentos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Equipamentos",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Equipamentos");
        }
    }
}

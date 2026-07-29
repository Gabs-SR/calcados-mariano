import './App.css';

function App() {
  const produtosMock = [
    {
      id: 1,
      nome: "Tênis Esportivo Runner Pro",
      marca: "Nike",
      preco: 299.90,
      tamanhos: "38 ao 42",
      imagem_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      nome: "Sapato Social Couro Comfort",
      marca: "Pegada",
      preco: 189.90,
      tamanhos: "39 ao 44",
      imagem_url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      nome: "Bota Adventure Trilha",
      marca: "Macboot",
      preco: 349.50,
      tamanhos: "37 ao 43",
      imagem_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      nome: "Tênis Casual Urban Street",
      marca: "Adidas",
      preco: 219.90,
      tamanhos: "37 ao 41",
      imagem_url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const numeroWhatsApp = "5511999999999";

  return (
    <div className="site-wrapper">
      {/* Barra de Segurança / Confiança Superior */}
      <div className="top-bar-security">
        <span>🔒 Compra 100% Segura e Verificada</span>
        <span>🛡️ Site Protegido com Criptografia SSL</span>
        <span>⚡ Atendimento e Suporte via WhatsApp</span>
      </div>

      {/* Cabeçalho */}
      <header className="main-header">
        <div className="header-container">
          <h1 className="logo">CALÇADOS <span>MARIANO</span></h1>
          <p className="slogan">O melhor estilo para os seus pés</p>
        </div>
      </header>

      {/* Vitrine */}
      <main className="container">
        <div className="section-title">
          <h2>Destaques da Semana</h2>
          <p>Escolha seu modelo e tire dúvidas direto com nossos atendentes com total segurança</p>
        </div>

        <div className="grid-produtos">
          {produtosMock.map((produto) => {
            const mensagem = `Olá! Tenho interesse no modelo: ${produto.nome} (Ref: ${produto.id})`;
            const linkWhatsapp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

            return (
              <div className="card" key={produto.id}>
                <div className="badge-seguranca">🛡️ Garantia Mariano</div>
                <img src={produto.imagem_url} alt={produto.nome} />
                <div className="card-info">
                  <span className="marca">{produto.marca}</span>
                  <h2>{produto.nome}</h2>
                  <p className="tamanhos">Tamanhos: {produto.tamanhos}</p>
                  <p className="preco">R$ {produto.preco.toFixed(2).replace('.', ',')}</p>
                  
                  <a href={linkWhatsapp} target="_blank" rel="noreferrer" className="btn-whatsapp">
                    Consultar no WhatsApp 💬
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Rodapé Seguro */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h3>Calçados Mariano</h3>
            <p>Tradição, qualidade e segurança em calçados para toda a família.</p>
          </div>
          <div className="footer-col">
            <h3>Segurança e Privacidade</h3>
            <p>🛡️ Ambiente 100% Seguro</p>
            <p>✔️ Parcerias Verificadas</p>
            <p>🔒 Seus dados protegidos</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Calçados Mariano - Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default App;
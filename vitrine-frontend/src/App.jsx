import { useState } from 'react';
import './App.css';

function App() {
  // Estados da aplicação
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todos');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  // Lista de produtos mockados (com fotos reais e dados completos)
  const produtosMock = [
    {
      id: 1,
      nome: "Tênis Esportivo Runner Pro",
      marca: "Nike",
      categoria: "Esporte",
      preco: 299.90,
      tamanhos: "38 ao 42",
      descricao: "Desenvolvido para máxima performance e conforto no dia a dia. Solado emborrachado de alta durabilidade e tecido respirável.",
      imagem_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      nome: "Sapato Social Couro Comfort",
      marca: "Pegada",
      categoria: "Masculino",
      preco: 189.90,
      tamanhos: "39 ao 44",
      descricao: "Confeccionado em couro legítimo. Design clássico e elegante, ideal para reuniões, eventos formais e trabalho.",
      imagem_url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      nome: "Bota Adventure Trilha",
      marca: "Macboot",
      categoria: "Esporte",
      preco: 349.50,
      tamanhos: "37 ao 43",
      descricao: "Resistente à água e ideal para trilhas ou uso urbano robusto. Solado tratorado antiderrapante para total segurança.",
      imagem_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      nome: "Tênis Casual Urban Street",
      marca: "Adidas",
      categoria: "Feminino",
      preco: 219.90,
      tamanhos: "37 ao 41",
      descricao: "Estilo urbano autêntico que combina perfeitamente com jeans, vestidos ou bermudas. Conforto prolongado para passeios.",
      imagem_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 5,
      nome: "Sandália Anatômica Comfort",
      marca: "Anabela",
      categoria: "Feminino",
      preco: 129.90,
      tamanhos: "34 ao 39",
      descricao: "Palmilha anatômica ultra macia que reduz o impacto ao caminhar. Praticidade e frescor para os dias mais quentes.",
      imagem_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 6,
      nome: "Chuteira Campo Society Master",
      marca: "Umbro",
      categoria: "Esporte",
      preco: 259.90,
      tamanhos: "38 ao 43",
      descricao: "Trava fixa para excelente aderência no gramado sintético. Toque de bola preciso e cabedal reforçado.",
      imagem_url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 7,
      nome: "Mocassim Casual em Couro",
      marca: "Ferracini",
      categoria: "Masculino",
      preco: 239.90,
      tamanhos: "38 ao 43",
      descricao: "Praticidade e elegância sem cadarço. Produzido em couro macio com costuras reforçadas à mão.",
      imagem_url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 8,
      nome: "Tênis Infantil Luzes Divertido",
      marca: "Klin",
      categoria: "Feminino",
      preco: 149.90,
      tamanhos: "26 ao 33",
      descricao: "Luzes de led que piscam a cada passo. Calce fácil com fecho de contato, garantindo independência e diversão para os pequenos.",
      imagem_url: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const numeroWhatsApp = "5537998275086";

  // Filtra os produtos dependendo da categoria escolhida no topo
  const produtosFiltrados = categoriaSelecionada === 'Todos' 
    ? produtosMock 
    : produtosMock.filter(p => p.categoria === categoriaSelecionada);

  return (
    <div className="site-wrapper">
      {/* Barra de Segurança Superior */}
      <div className="top-bar-security">
        <span>🔒 Compra 100% Segura e Verificada</span>
        <span>🛡️ Site Protegido com Criptografia SSL</span>
        <span>⚡ Atendimento e Suporte via WhatsApp</span>
      </div>

      {/* Cabeçalho e Menu */}
      <header className="main-header">
        <div className="header-container">
          <h1 className="logo">CALÇADOS <span>MARIANO</span></h1>
          <p className="slogan">O melhor estilo para os seus pés</p>
        </div>

        <nav className="nav-categorias">
          {['Todos', 'Masculino', 'Feminino', 'Esporte'].map((cat) => (
            <button
              key={cat}
              className={`btn-categoria ${categoriaSelecionada === cat ? 'ativo' : ''}`}
              onClick={() => setCategoriaSelecionada(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
      </header>

      {/* Vitrine Principal */}
      <main className="container">
        <div className="section-title">
          <h2>Destaques da Semana ({categoriaSelecionada})</h2>
          <p>Clique em qualquer calçado para ver detalhes completos e garantir o seu!</p>
        </div>

        <div className="grid-produtos">
          {produtosFiltrados.length > 0 ? (
            produtosFiltrados.map((produto) => {
              return (
                <div 
                  className="card" 
                  key={produto.id} 
                  onClick={() => setProdutoSelecionado(produto)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="badge-seguranca">🛡️ Garantia Mariano</div>
                  <img src={produto.imagem_url} alt={produto.nome} />
                  <div className="card-info">
                    <span className="marca">{produto.marca}</span>
                    <h2>{produto.nome}</h2>
                    <p className="tamanhos">Tamanhos: {produto.tamanhos}</p>
                    <p className="preco">R$ {produto.preco.toFixed(2).replace('.', ',')}</p>
                    
                    <button className="btn-whatsapp" style={{ width: '100%', border: 'none', pointerEvents: 'none' }}>
                      Ver Detalhes 🔍
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#666', padding: '40px' }}>
              Nenhum produto encontrado nesta categoria no momento.
            </p>
          )}
        </div>
      </main>

      {/* MODAL (JANELA) DE DETALHES DO PRODUTO */}
      {produtoSelecionado && (
        <div className="modal-overlay" onClick={() => setProdutoSelecionado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setProdutoSelecionado(null)}>✕</button>
            
            <div className="modal-grid">
              <div className="modal-img-container">
                <img src={produtoSelecionado.imagem_url} alt={produtoSelecionado.nome} />
              </div>
              <div className="modal-details">
                <span className="marca">{produtoSelecionado.marca}</span>
                <h2>{produtoSelecionado.nome}</h2>
                <p className="modal-preco">R$ {produtoSelecionado.preco.toFixed(2).replace('.', ',')}</p>
                
                <div className="modal-secao-info">
                  <p><strong>Tamanhos Disponíveis:</strong> {produtoSelecionado.tamanhos}</p>
                  <p><strong>Descrição do Calçado:</strong> {produtoSelecionado.descricao}</p>
                </div>

                <div className="modal-botoes">
                  <a 
                    href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(`Olá! Tenho interesse no modelo: ${produtoSelecionado.nome} (Ref: ${produtoSelecionado.id})`)}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-whatsapp"
                    style={{ textAlign: 'center', display: 'block', padding: '12px', textDecoration: 'none' }}
                  >
                    Comprar / Tirar Dúvidas no WhatsApp 💬
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé institucional com os dados da loja */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h3>Calçados Mariano</h3>
            <p>A loja do Antonio Lasmar! 40 anos calçando você e sua família!!</p>
          </div>
          <div className="footer-col">
            <h3>Nossos Contatos & Lojas (Bambuí - MG)</h3>
            <p>📞 Matriz: (37) 3431-2762</p>
            <p>📞 Filial: (37) 3431-2270</p>
            <p>📱 WhatsApp: (37) 99827-5086</p>
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
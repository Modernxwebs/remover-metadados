/**
 * Shared FAQ data for both visual UI rendering and Schema.org JSON-LD generation.
 * Keeping a single source of truth ensures 100% compliance with Google's FAQ guidelines.
 */
export const faqs = [
  {
    q: "O que é um removedor de metadados e como ele funciona?",
    a: "Um removedor de metadados é uma ferramenta que analisa a estrutura binária dos seus arquivos e elimina cabeçalhos ocultos de informações extras (como EXIF, XMP, IPTC e propriedades de autoria). Nosso sistema faz tudo no próprio navegador via JavaScript, o que significa que nenhum dado ou foto é enviado para a internet ou armazenado em servidores externos.",
  },
  {
    q: "Como remover metadados de fotos no celular (Android e iPhone) ou PC?",
    a: "Para remover metadados de fotos, basta abrir o site em qualquer navegador (Chrome, Safari, Firefox, Edge) no celular ou computador, arrastar ou selecionar as imagens desejadas e aguardar o processamento automático. Em segundos, as coordenadas de GPS, modelo da câmera e data/hora são permanentemente apagados, gerando um novo arquivo limpo para download.",
  },
  {
    q: "Limpar metadados ou apagar dados EXIF reduz a qualidade da foto ou do vídeo?",
    a: "Não. A limpeza de metadados atua estritamente sobre os blocos de cabeçalho informativo do arquivo. A matriz de pixels da imagem, a resolução, as cores e o áudio permanecem 100% idênticos ao original. Você obtém a mesma qualidade visual, porém sem qualquer informação pessoal embutida.",
  },
  {
    q: "Como retirar metadados de vários arquivos em lote?",
    a: "Você pode selecionar dezenas de arquivos simultaneamente na área de seleção. Nosso removedor de metadados processa cada arquivo em paralelo direto na memória do seu navegador. Ao final, você pode baixar cada item individualmente ou clicar em 'Baixar todos (.zip)' para salvar tudo em um único arquivo compactado e higienizado.",
  },
  {
    q: "É seguro usar este removedor de metadados para documentos confidenciais?",
    a: "Sim, é 100% seguro e em total conformidade com a LGPD (Lei Geral de Proteção de Dados). Como o algoritmo roda exclusivamente no seu próprio dispositivo sem conexão com bancos de dados externos, segredos industriais, contratos jurídicos, dados médicos e documentos bancários nunca ficam expostos na rede.",
  },
  {
    q: "Quais são os metadados mais perigosos que devo apagar antes de compartilhar?",
    a: "Os mais críticos são as coordenadas de geolocalização GPS (que revelam onde você mora ou trabalha), dados biométricos de câmera, o nome do proprietário registrado no computador, o histórico de revisões anteriores de documentos e comentários marcados como 'excluídos' em arquivos Word e PDFs.",
  },
  {
    q: "Preciso pagar ou criar uma conta para tirar metadados?",
    a: "Não. O Remover Metadados é um serviço gratuito, sem cadastro, sem assinaturas e sem limites de quantidade de arquivos. Nossa missão é democratizar a privacidade digital e fornecer uma ferramenta rápida e acessível para todos os brasileiros.",
  },
];

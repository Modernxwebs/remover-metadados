/**
 * Shared FAQ data for both visual UI rendering and Schema.org JSON-LD generation.
 * Keeping a single source of truth ensures 100% compliance with Google's FAQ guidelines.
 */
export const faqs = [
  {
    q: "O que é um removedor de metadados e como ele funciona?",
    a: "Um removedor de metadados é uma ferramenta que analisa a estrutura binária dos seus arquivos e elimina cabeçalhos ocultos de informações extras (como EXIF, XMP, IPTC e propriedades de autoria). Nosso sistema faz tudo no próprio navegador via JavaScript, o que significa que o conteúdo dos arquivos não é enviado para processamento remoto. O site usa analytics e fontes externas; mapas são opcionais.",
  },
  {
    q: "Como remover metadados de fotos no celular (Android e iPhone) ou PC?",
    a: "Para remover metadados de fotos, basta abrir o site em qualquer navegador (Chrome, Safari, Firefox, Edge) no celular ou computador, arrastar ou selecionar as imagens desejadas e aguardar o processamento automático. Em segundos, as coordenadas de GPS, modelo da câmera e data/hora são permanentemente apagados, gerando um novo arquivo limpo para download.",
  },
  {
    q: "Limpar metadados ou apagar dados EXIF reduz a qualidade da foto ou do vídeo?",
    a: "Depende do formato. PNG normalmente mantém os dados comprimidos dos pixels ao remover blocos de metadados. JPEG e WebP são recodificados com qualidade 0,95; AVIF usa 0,85 e pode ter saída WebP se o codificador falhar. Isso pode alterar pixels e cores. HEIC vira JPEG; GIF, BMP e TIFF viram PNG, com apenas um quadro ou página. Conversões também recodificam a imagem. Vídeos não são recomprimidos, mas a cobertura de metadados é limitada. Consulte a página de verificação e revise a cópia baixada.",
  },
  {
    q: "Como retirar metadados de vários arquivos em lote?",
    a: "Você pode selecionar dezenas de arquivos simultaneamente na área de seleção. Nosso removedor de metadados processa cada arquivo em paralelo direto na memória do seu navegador. Ao final, você pode baixar cada item individualmente ou clicar em 'Baixar todos (.zip)' para salvar tudo em um único arquivo compactado e limpo.",
  },
  {
    q: "É seguro usar este removedor de metadados para documentos confidenciais?",
    a: "Os arquivos são processados no seu dispositivo sem upload. Isso não garante anonimização completa: comentários, alterações controladas, anexos e dados visíveis podem permanecer em documentos. O site usa Google Analytics e Google Fonts; mapas externos só recebem coordenadas após sua escolha. Confira a política de privacidade e os testes por formato antes de compartilhar documentos confidenciais.",
  },
  {
    q: "Quais são os metadados mais perigosos que devo apagar antes de compartilhar?",
    a: "Os mais críticos são as coordenadas de geolocalização GPS (que revelam onde você mora ou trabalha), dados biométricos de câmera, o nome do proprietário registrado no computador, o histórico de revisões anteriores de documentos e comentários marcados como 'excluídos' em arquivos Word e PDFs.",
  },
  {
    q: "Posso soltar arquivos em qualquer lugar da tela e escolher o formato de download?",
    a: "Sim! Você pode soltar fotos, PDFs ou documentos em qualquer ponto da tela (não precisa mirar em uma caixa minúscula). Além disso, nosso sistema permite escolher se deseja baixar a imagem na saída padrão por tipo de arquivo ou convertê-la instantaneamente para JPG, PNG, WebP, AVIF ou baixar todos os formatos em um arquivo ZIP. Todo o processamento e conversão acontecem 100% no seu dispositivo, sem envio a servidores.",
  },
  {
    q: "Preciso pagar ou criar uma conta para tirar metadados?",
    a: "Não. O Remover Metadados é um serviço gratuito, sem cadastro, sem assinaturas e sem limites de quantidade de arquivos. Nossa missão é democratizar a privacidade digital e fornecer uma ferramenta rápida e acessível para todos os brasileiros.",
  },
];

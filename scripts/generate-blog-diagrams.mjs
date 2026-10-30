import sharp from 'sharp';
import path from 'node:path';

const outDir = path.resolve('public/images/blog');

// Color Palette
const BG = '#111010';
const CARD_BG = '#191817';
const CARD_BORDER = '#2c2927';
const TEXT = '#f5f3ef';
const TEXT_MUTED = '#9c9792';
const ACCENT_GREEN = '#10b981';
const ACCENT_YELLOW = '#f59e0b';
const ACCENT_RED = '#ef4444';
const ACCENT_BLUE = '#3b82f6';
const ACCENT_CYAN = '#06b6d4';

// =========================================================================
// PORTUGUESE DIAGRAMS
// =========================================================================

async function generateComparisonPt() {
  const svg = `
  <svg width="1376" height="768" viewBox="0 0 1376 768" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141312"/>
        <stop offset="100%" stop-color="#0a0a0a"/>
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
      </filter>
    </defs>

    <rect width="1376" height="768" fill="url(#bgGrad)"/>
    <rect x="24" y="24" width="1328" height="720" rx="16" fill="none" stroke="${CARD_BORDER}" stroke-width="2"/>

    <rect x="60" y="55" width="220" height="30" rx="15" fill="#22201e" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="75" cy="70" r="5" fill="${ACCENT_CYAN}"/>
    <text x="90" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}" letter-spacing="1.5">ANÁLISE TÉCNICA COMPARATIVA</text>

    <text x="60" y="125" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="${TEXT}" letter-spacing="-0.5">WhatsApp &amp; Telegram: Como Cada Modo Trata Suas Fotos</text>
    <text x="60" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="${TEXT_MUTED}">A diferença crucial entre a compressão da galeria e a transferência bruta de arquivos em modo documento</text>

    <!-- Card 1 -->
    <g transform="translate(60, 195)">
      <rect width="395" height="495" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow)"/>
      <rect x="20" y="20" width="165" height="32" rx="6" fill="#064e3b" stroke="${ACCENT_GREEN}" stroke-width="1.5"/>
      <text x="32" y="41" font-family="monospace" font-size="13" font-weight="700" fill="#a7f3d0">MODO PADRÃO</text>
      <text x="20" y="85" font-family="sans-serif" font-size="20" font-weight="700" fill="${TEXT}">Envio pela Galeria</text>
      <text x="20" y="110" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Fluxo clássico de fotos no chat</text>
      <line x1="20" y1="130" x2="375" y2="130" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <g transform="translate(20, 150)">
        <text y="15" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">RESOLUÇÃO DE IMAGEM</text>
        <text y="38" font-family="sans-serif" font-size="15" font-weight="600" fill="${TEXT}">Reduzida (~1600 a 2048px)</text>
        <text y="58" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Recomprime em JPEG/WebP</text>
        <text y="100" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">METADADOS EXIF DA CÂMERA</text>
        <text y="123" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_GREEN}">✓ 100% Removidos</text>
        <text y="143" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Descartados na recodificação</text>
        <text y="185" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">COORDENADAS GPS DE SATÉLITE</text>
        <text y="208" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_GREEN}">✓ Apagadas</text>
        <text y="228" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Destinatário não vê localização</text>
        <rect y="260" width="355" height="60" rx="8" fill="#062e24" stroke="${ACCENT_GREEN}" stroke-width="1"/>
        <text x="15" y="285" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_GREEN}">VEREDITO DE PRIVACIDADE</text>
        <text x="15" y="305" font-family="sans-serif" font-size="13" fill="#d1fae5">Seguro para fotos casuais, mas com baixa nitidez</text>
      </g>
    </g>

    <!-- Card 2 -->
    <g transform="translate(485, 195)">
      <rect width="395" height="495" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow)"/>
      <rect x="20" y="20" width="135" height="32" rx="6" fill="#451a03" stroke="${ACCENT_YELLOW}" stroke-width="1.5"/>
      <text x="32" y="41" font-family="monospace" font-size="13" font-weight="700" fill="#fde68a">MODO HD</text>
      <text x="20" y="85" font-family="sans-serif" font-size="20" font-weight="700" fill="${TEXT}">Seletor "HD" no Topo</text>
      <text x="20" y="110" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Botão HD recente do WhatsApp</text>
      <line x1="20" y1="130" x2="375" y2="130" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <g transform="translate(20, 150)">
        <text y="15" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">RESOLUÇÃO DE IMAGEM</text>
        <text y="38" font-family="sans-serif" font-size="15" font-weight="600" fill="${TEXT}">Alta (Até ~4096px)</text>
        <text y="58" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Leve compressão visual</text>
        <text y="100" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">METADADOS EXIF DA CÂMERA</text>
        <text y="123" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_YELLOW}">⚠ Parcialmente limpos</text>
        <text y="143" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Purga tags técnicas sensíveis</text>
        <text y="185" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">COORDENADAS GPS DE SATÉLITE</text>
        <text y="208" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_GREEN}">✓ Apagadas</text>
        <text y="228" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">GPS removido no pipeline</text>
        <rect y="260" width="355" height="60" rx="8" fill="#3b2505" stroke="${ACCENT_YELLOW}" stroke-width="1"/>
        <text x="15" y="285" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_YELLOW}">VEREDITO DE PRIVACIDADE</text>
        <text x="15" y="305" font-family="sans-serif" font-size="13" fill="#fef3c7">Ótimo equilíbrio entre nitidez e segurança</text>
      </g>
    </g>

    <!-- Card 3 -->
    <g transform="translate(910, 195)">
      <rect width="395" height="495" rx="12" fill="${CARD_BG}" stroke="${ACCENT_RED}" stroke-width="2" filter="url(#shadow)"/>
      <rect x="20" y="20" width="180" height="32" rx="6" fill="#450a0a" stroke="${ACCENT_RED}" stroke-width="1.5"/>
      <text x="32" y="41" font-family="monospace" font-size="13" font-weight="700" fill="#fca5a5">MODO DOCUMENTO</text>
      <text x="20" y="85" font-family="sans-serif" font-size="20" font-weight="700" fill="${TEXT}">Anexar como Documento</text>
      <text x="20" y="110" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Transferência de arquivo original</text>
      <line x1="20" y1="130" x2="375" y2="130" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <g transform="translate(20, 150)">
        <text y="15" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">RESOLUÇÃO DE IMAGEM</text>
        <text y="38" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_GREEN}">100% Original e Intacta</text>
        <text y="58" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Zero compressão ou alteração</text>
        <text y="100" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">METADADOS EXIF DA CÂMERA</text>
        <text y="123" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_RED}">✖ 100% Expostos</text>
        <text y="143" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Modelo, serial, lente e milissegundo</text>
        <text y="185" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">COORDENADAS GPS DE SATÉLITE</text>
        <text y="208" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_RED}">✖ GPS Exato com Mapa</text>
        <text y="228" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Vaza residência, escola ou local de trabalho</text>
        <rect y="260" width="355" height="60" rx="8" fill="#3b0a0a" stroke="${ACCENT_RED}" stroke-width="1"/>
        <text x="15" y="285" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_RED}">PERIGO DE VAZAMENTO</text>
        <text x="15" y="305" font-family="sans-serif" font-size="13" fill="#fee2e2">Higienize antes de enviar para desconhecidos!</text>
      </g>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(path.join(outDir, 'whatsapp-modos-envio-comparativo.jpg'));
}

async function generateInspectionPt() {
  const svg = `
  <svg width="1376" height="768" viewBox="0 0 1376 768" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141312"/>
        <stop offset="100%" stop-color="#090909"/>
      </linearGradient>
      <filter id="shadow2" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <rect width="1376" height="768" fill="url(#bgGrad2)"/>
    <rect x="24" y="24" width="1328" height="720" rx="16" fill="none" stroke="${CARD_BORDER}" stroke-width="2"/>

    <rect x="60" y="55" width="230" height="30" rx="15" fill="#22201e" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="75" cy="70" r="5" fill="${ACCENT_RED}"/>
    <text x="90" y="74" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}" letter-spacing="1.5">FORENSE DIGITAL &amp; OSINT</text>

    <text x="60" y="125" font-family="sans-serif" font-size="34" font-weight="800" fill="${TEXT}" letter-spacing="-0.5">O Que Fica Exposto em uma Foto Enviada como Documento</text>
    <text x="60" y="155" font-family="sans-serif" font-size="16" fill="${TEXT_MUTED}">Qualquer destinatário pode extrair esses dados confidenciais abrindo o arquivo em um visualizador ou no computador</text>

    <g transform="translate(60, 195)">
      <rect width="520" height="495" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow2)"/>
      <rect x="24" y="24" width="472" height="310" rx="8" fill="#1f2937"/>
      <line x1="24" y1="100" x2="496" y2="100" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="24" y1="180" x2="496" y2="180" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="24" y1="260" x2="496" y2="260" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="140" y1="24" x2="140" y2="334" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="260" y1="24" x2="260" y2="334" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="380" y1="24" x2="380" y2="334" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <circle cx="260" cy="180" r="42" fill="none" stroke="${ACCENT_RED}" stroke-width="2" stroke-dasharray="6,4"/>
      <circle cx="260" cy="180" r="14" fill="${ACCENT_RED}" fill-opacity="0.3"/>
      <circle cx="260" cy="180" r="6" fill="${ACCENT_RED}"/>
      <line x1="260" y1="120" x2="260" y2="240" stroke="${ACCENT_RED}" stroke-width="1.5"/>
      <line x1="200" y1="180" x2="320" y2="180" stroke="${ACCENT_RED}" stroke-width="1.5"/>
      <rect x="175" y="105" width="170" height="26" rx="4" fill="#7f1d1d" stroke="${ACCENT_RED}" stroke-width="1"/>
      <text x="185" y="122" font-family="monospace" font-size="11" font-weight="700" fill="#fecaca">📍 GPS: -23.5505, -46.6333</text>
      <rect x="24" y="354" width="472" height="115" rx="8" fill="#141312" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="44" y="380" font-family="sans-serif" font-size="14" font-weight="700" fill="${TEXT}">Arquivo Bruto Transmitido: IMG_8291.HEIC / .JPG</text>
      <text x="44" y="402" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Tamanho: 8.4 MB (Resolução: 4032 x 3024 px — 100% dos dados mantidos)</text>
      <text x="44" y="426" font-family="monospace" font-size="11" fill="${ACCENT_RED}">Status: Cabeçalho binário EXIF e XMP completamente legível</text>
      <text x="44" y="448" font-family="sans-serif" font-size="11" fill="${TEXT_MUTED}">Enviado através da opção: [ 📎 Anexar Documento ]</text>
    </g>

    <g transform="translate(610, 195)">
      <rect width="706" height="495" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow2)"/>
      <text x="30" y="40" font-family="sans-serif" font-size="18" font-weight="700" fill="${TEXT}">Relatório Forense de Metadados Extraídos</text>
      <text x="30" y="62" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Dados lidos diretamente do arquivo sem necessidade de senha ou privilégios</text>
      <line x1="30" y1="80" x2="676" y2="80" stroke="${CARD_BORDER}" stroke-width="1.5"/>

      <g transform="translate(30, 95)">
        <rect width="646" height="60" rx="8" fill="#2d1212" stroke="${ACCENT_RED}" stroke-width="1"/>
        <text x="20" y="24" font-family="monospace" font-size="12" font-weight="700" fill="#fca5a5">CAMPO: GPSLatitude / GPSLongitude / GPSAltitude</text>
        <text x="20" y="46" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">23° 33' 1.87" S, 46° 38' 0.01" W (Altitude: 760m — 8º andar)</text>
      </g>

      <g transform="translate(30, 165)">
        <rect width="646" height="60" rx="8" fill="#1e1c1a" stroke="${CARD_BORDER}" stroke-width="1"/>
        <text x="20" y="24" font-family="monospace" font-size="12" font-weight="700" fill="${ACCENT_CYAN}">CAMPO: DateTimeOriginal &amp; SubSecTime</text>
        <text x="20" y="46" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">30/10/2026 às 14:32:15.842 (Fuso Horário: UTC-03:00 Brasil)</text>
      </g>

      <g transform="translate(30, 235)">
        <rect width="646" height="60" rx="8" fill="#1e1c1a" stroke="${CARD_BORDER}" stroke-width="1"/>
        <text x="20" y="24" font-family="monospace" font-size="12" font-weight="700" fill="${ACCENT_YELLOW}">CAMPO: Make / Model / Software</text>
        <text x="20" y="46" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Apple iPhone 16 Pro Max • iOS 19.3.1 (Build 23D61)</text>
      </g>

      <g transform="translate(30, 305)">
        <rect width="646" height="60" rx="8" fill="#1e1c1a" stroke="${CARD_BORDER}" stroke-width="1"/>
        <text x="20" y="24" font-family="monospace" font-size="12" font-weight="700" fill="${TEXT_MUTED}">CAMPO: LensModel / FocalLength / ISO</text>
        <text x="20" y="46" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">iPhone 16 Pro Max back triple camera 6.76mm f/1.78 • ISO 64</text>
      </g>

      <g transform="translate(30, 385)">
        <rect width="646" height="75" rx="8" fill="#1c1917" stroke="${CARD_BORDER}" stroke-width="1.5"/>
        <text x="20" y="28" font-family="sans-serif" font-size="13" font-weight="700" fill="${TEXT}">⚠ Risco Prático para o Usuário:</text>
        <text x="20" y="48" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Ao cruzar a coordenada com imagens de satélite do Google Street View, qualquer estranho</text>
        <text x="20" y="65" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">identifica a fachada do seu prédio, horário de rotina e se você possui aparelhos caros.</text>
      </g>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(path.join(outDir, 'inspecao-metadados-gps-whatsapp.jpg'));
}

async function generateWorkflowPt() {
  const svg = `
  <svg width="1376" height="768" viewBox="0 0 1376 768" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141312"/>
        <stop offset="100%" stop-color="#0a0a0a"/>
      </linearGradient>
      <filter id="shadow3" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
      </filter>
    </defs>

    <rect width="1376" height="768" fill="url(#bgGrad3)"/>
    <rect x="24" y="24" width="1328" height="720" rx="16" fill="none" stroke="${CARD_BORDER}" stroke-width="2"/>

    <rect x="60" y="55" width="210" height="30" rx="15" fill="#22201e" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="75" cy="70" r="5" fill="${ACCENT_GREEN}"/>
    <text x="90" y="74" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}" letter-spacing="1.5">PROTOCOLO DE SEGURANÇA</text>

    <text x="60" y="125" font-family="sans-serif" font-size="34" font-weight="800" fill="${TEXT}" letter-spacing="-0.5">Como Enviar Fotos em Qualidade Máxima sem Vazamentos</text>
    <text x="60" y="155" font-family="sans-serif" font-size="16" fill="${TEXT_MUTED}">O passo a passo recomendado para manter 100% da nitidez profissional e blindar sua localização residencial</text>

    <!-- Step 1 -->
    <g transform="translate(60, 210)">
      <rect width="285" height="460" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow3)"/>
      <circle cx="45" cy="45" r="22" fill="#27272a" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <text x="39" y="52" font-family="monospace" font-size="18" font-weight="800" fill="${ACCENT_CYAN}">1</text>
      <text x="80" y="42" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">PASSO 1</text>
      <text x="80" y="60" font-family="sans-serif" font-size="16" font-weight="700" fill="${TEXT}">Captura da Foto</text>
      <line x1="20" y1="85" x2="265" y2="85" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="20" y="120" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Foto no Smartphone</text>
      <text x="20" y="145" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Você tira uma foto de alta resolução com seu celular ou câmera.</text>
      <rect x="20" y="180" width="245" height="110" rx="8" fill="#241414" stroke="${ACCENT_RED}" stroke-width="1"/>
      <text x="32" y="208" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_RED}">ESTADO INICIAL:</text>
      <text x="32" y="232" font-family="sans-serif" font-size="12" fill="#fecaca">• Resolução: Máxima</text>
      <text x="32" y="252" font-family="sans-serif" font-size="12" fill="#fecaca">• GPS Satélite: Embutido</text>
      <text x="32" y="272" font-family="sans-serif" font-size="12" fill="#fecaca">• Serial Câmera: Embutido</text>
      <text x="20" y="325" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Não envie diretamente como documento sem antes higienizar!</text>
    </g>

    <path d="M 355 430 L 375 430" stroke="${ACCENT_CYAN}" stroke-width="3" stroke-linecap="round"/>

    <!-- Step 2 -->
    <g transform="translate(385, 210)">
      <rect width="285" height="460" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow3)"/>
      <circle cx="45" cy="45" r="22" fill="#064e3b" stroke="${ACCENT_GREEN}" stroke-width="1.5"/>
      <text x="39" y="52" font-family="monospace" font-size="18" font-weight="800" fill="#a7f3d0">2</text>
      <text x="80" y="42" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_GREEN}">PASSO 2 (CHAVE)</text>
      <text x="80" y="60" font-family="sans-serif" font-size="16" font-weight="700" fill="${TEXT}">Limpeza no Navegador</text>
      <line x1="20" y1="85" x2="265" y2="85" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="20" y="120" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Remover Metadados</text>
      <text x="20" y="145" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Arraste a foto para qualquer lugar da tela na nossa ferramenta gratuita.</text>
      <rect x="20" y="180" width="245" height="110" rx="8" fill="#062e24" stroke="${ACCENT_GREEN}" stroke-width="1"/>
      <text x="32" y="208" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_GREEN}">PROCESSAMENTO LOCAL:</text>
      <text x="32" y="232" font-family="sans-serif" font-size="12" fill="#d1fae5">• Zero envio para a nuvem</text>
      <text x="32" y="252" font-family="sans-serif" font-size="12" fill="#d1fae5">• GPS apagado no navegador</text>
      <text x="32" y="272" font-family="sans-serif" font-size="12" fill="#d1fae5">• EXIF sensível deletado</text>
      <text x="20" y="325" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Funciona em segundos via JavaScript local no celular ou PC.</text>
    </g>

    <path d="M 680 430 L 700 430" stroke="${ACCENT_GREEN}" stroke-width="3" stroke-linecap="round"/>

    <!-- Step 3 -->
    <g transform="translate(710, 210)">
      <rect width="285" height="460" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow3)"/>
      <circle cx="45" cy="45" r="22" fill="#27272a" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <text x="39" y="52" font-family="monospace" font-size="18" font-weight="800" fill="${ACCENT_YELLOW}">3</text>
      <text x="80" y="42" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">PASSO 3</text>
      <text x="80" y="60" font-family="sans-serif" font-size="16" font-weight="700" fill="${TEXT}">Download Limpo</text>
      <line x1="20" y1="85" x2="265" y2="85" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="20" y="120" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Baixar Imagem Higienizada</text>
      <text x="20" y="145" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Baixe o novo arquivo gerado com os pixels puros preservados.</text>
      <rect x="20" y="180" width="245" height="110" rx="8" fill="#18181b" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="32" y="208" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT}">OPÇÃO DE FORMATO:</text>
      <text x="32" y="232" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">• Saída Padrão (Sem perda)</text>
      <text x="32" y="252" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">• Ou JPG, PNG, WebP, AVIF</text>
      <text x="32" y="272" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">• Ou Todos juntos em .ZIP</text>
      <text x="20" y="325" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Você pode inspecionar no Visualizador para garantir GPS vazio.</text>
    </g>

    <path d="M 1005 430 L 1025 430" stroke="${ACCENT_YELLOW}" stroke-width="3" stroke-linecap="round"/>

    <!-- Step 4 -->
    <g transform="translate(1035, 210)">
      <rect width="285" height="460" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow3)"/>
      <circle cx="45" cy="45" r="22" fill="#1e3a8a" stroke="${ACCENT_BLUE}" stroke-width="1.5"/>
      <text x="39" y="52" font-family="monospace" font-size="18" font-weight="800" fill="#93c5fd">4</text>
      <text x="80" y="42" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_BLUE}">PASSO 4 (FINAL)</text>
      <text x="80" y="60" font-family="sans-serif" font-size="16" font-weight="700" fill="${TEXT}">Envio como Documento</text>
      <line x1="20" y1="85" x2="265" y2="85" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="20" y="120" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">WhatsApp ou Telegram</text>
      <text x="20" y="145" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Anexe o arquivo higienizado no menu Documento com total tranquilidade.</text>
      <rect x="20" y="180" width="245" height="110" rx="8" fill="#0f284d" stroke="${ACCENT_BLUE}" stroke-width="1"/>
      <text x="32" y="208" font-family="sans-serif" font-size="12" font-weight="700" fill="#60a5fa">RESULTADO PERFEITO:</text>
      <text x="32" y="232" font-family="sans-serif" font-size="12" fill="#bfdbfe">✓ 100% da nitidez óptica</text>
      <text x="32" y="252" font-family="sans-serif" font-size="12" fill="#bfdbfe">✓ Sem compressão do app</text>
      <text x="32" y="272" font-family="sans-serif" font-size="12" fill="#bfdbfe">✓ Zero coordenadas vazadas</text>
      <text x="20" y="325" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Segurança garantida para você e sua família.</text>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(path.join(outDir, 'fluxo-seguro-compartilhamento-fotos.jpg'));
}

// =========================================================================
// ENGLISH DIAGRAMS (DEDICATED FOR EN BLOG)
// =========================================================================

async function generateComparisonEn() {
  const svg = `
  <svg width="1376" height="768" viewBox="0 0 1376 768" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradEn" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141312"/>
        <stop offset="100%" stop-color="#0a0a0a"/>
      </linearGradient>
      <filter id="shadowEn" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
      </filter>
    </defs>

    <rect width="1376" height="768" fill="url(#bgGradEn)"/>
    <rect x="24" y="24" width="1328" height="720" rx="16" fill="none" stroke="${CARD_BORDER}" stroke-width="2"/>

    <rect x="60" y="55" width="240" height="30" rx="15" fill="#22201e" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="75" cy="70" r="5" fill="${ACCENT_CYAN}"/>
    <text x="90" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}" letter-spacing="1.5">COMPARATIVE TECHNICAL ANALYSIS</text>

    <text x="60" y="125" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="${TEXT}" letter-spacing="-0.5">WhatsApp &amp; Telegram: How Each Mode Treats Your Photos</text>
    <text x="60" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="${TEXT_MUTED}">The crucial difference between standard gallery compression and raw document transfer</text>

    <!-- Card 1: Standard Gallery -->
    <g transform="translate(60, 195)">
      <rect width="395" height="495" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadowEn)"/>
      <rect x="20" y="20" width="165" height="32" rx="6" fill="#064e3b" stroke="${ACCENT_GREEN}" stroke-width="1.5"/>
      <text x="32" y="41" font-family="monospace" font-size="13" font-weight="700" fill="#a7f3d0">STANDARD MODE</text>
      <text x="20" y="85" font-family="sans-serif" font-size="20" font-weight="700" fill="${TEXT}">Send via Gallery</text>
      <text x="20" y="110" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Standard chat photo dispatch</text>
      <line x1="20" y1="130" x2="375" y2="130" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <g transform="translate(20, 150)">
        <text y="15" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">IMAGE RESOLUTION</text>
        <text y="38" font-family="sans-serif" font-size="15" font-weight="600" fill="${TEXT}">Reduced (~1600 to 2048px)</text>
        <text y="58" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Re-encoded into JPEG/WebP</text>
        <text y="100" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">CAMERA EXIF METADATA</text>
        <text y="123" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_GREEN}">✓ 100% Stripped</text>
        <text y="143" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Discarded during re-encoding</text>
        <text y="185" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">SATELLITE GPS COORDINATES</text>
        <text y="208" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_GREEN}">✓ Purged</text>
        <text y="228" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Recipient sees zero location</text>
        <rect y="260" width="355" height="60" rx="8" fill="#062e24" stroke="${ACCENT_GREEN}" stroke-width="1"/>
        <text x="15" y="285" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_GREEN}">PRIVACY VERDICT</text>
        <text x="15" y="305" font-family="sans-serif" font-size="13" fill="#d1fae5">Safe for casual photos, but with lower sharpness</text>
      </g>
    </g>

    <!-- Card 2: HD Mode -->
    <g transform="translate(485, 195)">
      <rect width="395" height="495" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadowEn)"/>
      <rect x="20" y="20" width="125" height="32" rx="6" fill="#451a03" stroke="${ACCENT_YELLOW}" stroke-width="1.5"/>
      <text x="32" y="41" font-family="monospace" font-size="13" font-weight="700" fill="#fde68a">HD MODE</text>
      <text x="20" y="85" font-family="sans-serif" font-size="20" font-weight="700" fill="${TEXT}">"HD" Selector at Top</text>
      <text x="20" y="110" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Recent WhatsApp HD feature</text>
      <line x1="20" y1="130" x2="375" y2="130" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <g transform="translate(20, 150)">
        <text y="15" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">IMAGE RESOLUTION</text>
        <text y="38" font-family="sans-serif" font-size="15" font-weight="600" fill="${TEXT}">High (Up to ~4096px)</text>
        <text y="58" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Light visual compression</text>
        <text y="100" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">CAMERA EXIF METADATA</text>
        <text y="123" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_YELLOW}">⚠ Mostly Stripped</text>
        <text y="143" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Sensitive technical tags purged</text>
        <text y="185" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">SATELLITE GPS COORDINATES</text>
        <text y="208" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_GREEN}">✓ Purged</text>
        <text y="228" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">GPS removed during pipeline</text>
        <rect y="260" width="355" height="60" rx="8" fill="#3b2505" stroke="${ACCENT_YELLOW}" stroke-width="1"/>
        <text x="15" y="285" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_YELLOW}">PRIVACY VERDICT</text>
        <text x="15" y="305" font-family="sans-serif" font-size="13" fill="#fef3c7">Great balance between sharpness and security</text>
      </g>
    </g>

    <!-- Card 3: Document Mode -->
    <g transform="translate(910, 195)">
      <rect width="395" height="495" rx="12" fill="${CARD_BG}" stroke="${ACCENT_RED}" stroke-width="2" filter="url(#shadowEn)"/>
      <rect x="20" y="20" width="180" height="32" rx="6" fill="#450a0a" stroke="${ACCENT_RED}" stroke-width="1.5"/>
      <text x="32" y="41" font-family="monospace" font-size="13" font-weight="700" fill="#fca5a5">DOCUMENT MODE</text>
      <text x="20" y="85" font-family="sans-serif" font-size="20" font-weight="700" fill="${TEXT}">Attach as Document</text>
      <text x="20" y="110" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Raw uncompressed file transfer</text>
      <line x1="20" y1="130" x2="375" y2="130" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <g transform="translate(20, 150)">
        <text y="15" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">IMAGE RESOLUTION</text>
        <text y="38" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_GREEN}">100% Original &amp; Intact</text>
        <text y="58" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Zero compression or degradation</text>
        <text y="100" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">CAMERA EXIF METADATA</text>
        <text y="123" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_RED}">✖ 100% Exposed</text>
        <text y="143" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Model, serial, lens, and millisecond</text>
        <text y="185" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">SATELLITE GPS COORDINATES</text>
        <text y="208" font-family="sans-serif" font-size="15" font-weight="600" fill="${ACCENT_RED}">✖ Exact GPS Pin on Map</text>
        <text y="228" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Exposes home, school, or workplace</text>
        <rect y="260" width="355" height="60" rx="8" fill="#3b0a0a" stroke="${ACCENT_RED}" stroke-width="1"/>
        <text x="15" y="285" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_RED}">PRIVACY LEAK DANGER</text>
        <text x="15" y="305" font-family="sans-serif" font-size="13" fill="#fee2e2">Always sanitize before sending to strangers!</text>
      </g>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(path.join(outDir, 'whatsapp-transfer-modes-comparison.jpg'));
}

async function generateInspectionEn() {
  const svg = `
  <svg width="1376" height="768" viewBox="0 0 1376 768" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad2En" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141312"/>
        <stop offset="100%" stop-color="#090909"/>
      </linearGradient>
      <filter id="shadow2En" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <rect width="1376" height="768" fill="url(#bgGrad2En)"/>
    <rect x="24" y="24" width="1328" height="720" rx="16" fill="none" stroke="${CARD_BORDER}" stroke-width="2"/>

    <rect x="60" y="55" width="240" height="30" rx="15" fill="#22201e" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="75" cy="70" r="5" fill="${ACCENT_RED}"/>
    <text x="90" y="74" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}" letter-spacing="1.5">DIGITAL FORENSICS &amp; OSINT</text>

    <text x="60" y="125" font-family="sans-serif" font-size="34" font-weight="800" fill="${TEXT}" letter-spacing="-0.5">What Stays Exposed in a Photo Sent as a Document</text>
    <text x="60" y="155" font-family="sans-serif" font-size="16" fill="${TEXT_MUTED}">Any recipient can extract these sensitive fields simply by inspecting the file in a viewer or on their PC</text>

    <!-- Left panel -->
    <g transform="translate(60, 195)">
      <rect width="520" height="495" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow2En)"/>
      <rect x="24" y="24" width="472" height="310" rx="8" fill="#1f2937"/>
      <line x1="24" y1="100" x2="496" y2="100" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="24" y1="180" x2="496" y2="180" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="24" y1="260" x2="496" y2="260" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="140" y1="24" x2="140" y2="334" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="260" y1="24" x2="260" y2="334" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="380" y1="24" x2="380" y2="334" stroke="#374151" stroke-width="1" stroke-dasharray="4,4"/>
      <circle cx="260" cy="180" r="42" fill="none" stroke="${ACCENT_RED}" stroke-width="2" stroke-dasharray="6,4"/>
      <circle cx="260" cy="180" r="14" fill="${ACCENT_RED}" fill-opacity="0.3"/>
      <circle cx="260" cy="180" r="6" fill="${ACCENT_RED}"/>
      <line x1="260" y1="120" x2="260" y2="240" stroke="${ACCENT_RED}" stroke-width="1.5"/>
      <line x1="200" y1="180" x2="320" y2="180" stroke="${ACCENT_RED}" stroke-width="1.5"/>
      <rect x="175" y="105" width="170" height="26" rx="4" fill="#7f1d1d" stroke="${ACCENT_RED}" stroke-width="1"/>
      <text x="185" y="122" font-family="monospace" font-size="11" font-weight="700" fill="#fecaca">📍 GPS: 37.7749, -122.4194</text>
      <rect x="24" y="354" width="472" height="115" rx="8" fill="#141312" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="44" y="380" font-family="sans-serif" font-size="14" font-weight="700" fill="${TEXT}">Raw File Transmitted: IMG_8291.HEIC / .JPG</text>
      <text x="44" y="402" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Size: 8.4 MB (Resolution: 4032 x 3024 px — 100% data intact)</text>
      <text x="44" y="426" font-family="monospace" font-size="11" fill="${ACCENT_RED}">Status: Binary EXIF and XMP header completely readable</text>
      <text x="44" y="448" font-family="sans-serif" font-size="11" fill="${TEXT_MUTED}">Dispatched via option: [ 📎 Attach Document ]</text>
    </g>

    <!-- Right panel -->
    <g transform="translate(610, 195)">
      <rect width="706" height="495" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow2En)"/>
      <text x="30" y="40" font-family="sans-serif" font-size="18" font-weight="700" fill="${TEXT}">Forensic Metadata Extraction Report</text>
      <text x="30" y="62" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Data parsed directly from the file without requiring passwords or special privileges</text>
      <line x1="30" y1="80" x2="676" y2="80" stroke="${CARD_BORDER}" stroke-width="1.5"/>

      <g transform="translate(30, 95)">
        <rect width="646" height="60" rx="8" fill="#2d1212" stroke="${ACCENT_RED}" stroke-width="1"/>
        <text x="20" y="24" font-family="monospace" font-size="12" font-weight="700" fill="#fca5a5">TAG: GPSLatitude / GPSLongitude / GPSAltitude</text>
        <text x="20" y="46" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">37° 46' 29.6" N, 122° 25' 9.8" W (Altitude: 52m — 8th floor)</text>
      </g>

      <g transform="translate(30, 165)">
        <rect width="646" height="60" rx="8" fill="#1e1c1a" stroke="${CARD_BORDER}" stroke-width="1"/>
        <text x="20" y="24" font-family="monospace" font-size="12" font-weight="700" fill="${ACCENT_CYAN}">TAG: DateTimeOriginal &amp; SubSecTime</text>
        <text x="20" y="46" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">October 30, 2026 at 14:32:15.842 (Time Zone: UTC-07:00)</text>
      </g>

      <g transform="translate(30, 235)">
        <rect width="646" height="60" rx="8" fill="#1e1c1a" stroke="${CARD_BORDER}" stroke-width="1"/>
        <text x="20" y="24" font-family="monospace" font-size="12" font-weight="700" fill="${ACCENT_YELLOW}">TAG: Make / Model / Software</text>
        <text x="20" y="46" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Apple iPhone 16 Pro Max • iOS 19.3.1 (Build 23D61)</text>
      </g>

      <g transform="translate(30, 305)">
        <rect width="646" height="60" rx="8" fill="#1e1c1a" stroke="${CARD_BORDER}" stroke-width="1"/>
        <text x="20" y="24" font-family="monospace" font-size="12" font-weight="700" fill="${TEXT_MUTED}">TAG: LensModel / FocalLength / ISO</text>
        <text x="20" y="46" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">iPhone 16 Pro Max back triple camera 6.76mm f/1.78 • ISO 64</text>
      </g>

      <g transform="translate(30, 385)">
        <rect width="646" height="75" rx="8" fill="#1c1917" stroke="${CARD_BORDER}" stroke-width="1.5"/>
        <text x="20" y="28" font-family="sans-serif" font-size="13" font-weight="700" fill="${TEXT}">⚠ Practical Risk for Users:</text>
        <text x="20" y="48" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">By cross-referencing coordinates with Google Street View or Apple Look Around, strangers</text>
        <text x="20" y="65" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">can pinpoint your residential building, work routine, and high-value personal possessions.</text>
      </g>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(path.join(outDir, 'whatsapp-metadata-gps-inspection.jpg'));
}

async function generateWorkflowEn() {
  const svg = `
  <svg width="1376" height="768" viewBox="0 0 1376 768" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad3En" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141312"/>
        <stop offset="100%" stop-color="#0a0a0a"/>
      </linearGradient>
      <filter id="shadow3En" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
      </filter>
    </defs>

    <rect width="1376" height="768" fill="url(#bgGrad3En)"/>
    <rect x="24" y="24" width="1328" height="720" rx="16" fill="none" stroke="${CARD_BORDER}" stroke-width="2"/>

    <rect x="60" y="55" width="220" height="30" rx="15" fill="#22201e" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="75" cy="70" r="5" fill="${ACCENT_GREEN}"/>
    <text x="90" y="74" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}" letter-spacing="1.5">SECURITY PROTOCOL</text>

    <text x="60" y="125" font-family="sans-serif" font-size="34" font-weight="800" fill="${TEXT}" letter-spacing="-0.5">How to Share Photos in Maximum Quality Without Leaks</text>
    <text x="60" y="155" font-family="sans-serif" font-size="16" fill="${TEXT_MUTED}">The recommended step-by-step workflow to preserve 100% optical sharpness while shielding your home address</text>

    <!-- Step 1 -->
    <g transform="translate(60, 210)">
      <rect width="285" height="460" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow3En)"/>
      <circle cx="45" cy="45" r="22" fill="#27272a" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <text x="39" y="52" font-family="monospace" font-size="18" font-weight="800" fill="${ACCENT_CYAN}">1</text>
      <text x="80" y="42" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">STEP 1</text>
      <text x="80" y="60" font-family="sans-serif" font-size="16" font-weight="700" fill="${TEXT}">Photo Capture</text>
      <line x1="20" y1="85" x2="265" y2="85" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="20" y="120" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Photo on Smartphone</text>
      <text x="20" y="145" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">You snap a high-resolution photo on your phone or camera.</text>
      <rect x="20" y="180" width="245" height="110" rx="8" fill="#241414" stroke="${ACCENT_RED}" stroke-width="1"/>
      <text x="32" y="208" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_RED}">INITIAL STATE:</text>
      <text x="32" y="232" font-family="sans-serif" font-size="12" fill="#fecaca">• Resolution: Maximum</text>
      <text x="32" y="252" font-family="sans-serif" font-size="12" fill="#fecaca">• Satellite GPS: Embedded</text>
      <text x="32" y="272" font-family="sans-serif" font-size="12" fill="#fecaca">• Camera Serial: Embedded</text>
      <text x="20" y="325" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Do not send directly as a document before sanitizing!</text>
    </g>

    <path d="M 355 430 L 375 430" stroke="${ACCENT_CYAN}" stroke-width="3" stroke-linecap="round"/>

    <!-- Step 2 -->
    <g transform="translate(385, 210)">
      <rect width="285" height="460" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow3En)"/>
      <circle cx="45" cy="45" r="22" fill="#064e3b" stroke="${ACCENT_GREEN}" stroke-width="1.5"/>
      <text x="39" y="52" font-family="monospace" font-size="18" font-weight="800" fill="#a7f3d0">2</text>
      <text x="80" y="42" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_GREEN}">STEP 2 (KEY)</text>
      <text x="80" y="60" font-family="sans-serif" font-size="16" font-weight="700" fill="${TEXT}">In-Browser Cleaning</text>
      <line x1="20" y1="85" x2="265" y2="85" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="20" y="120" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Metadata Remover</text>
      <text x="20" y="145" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Drag the photo anywhere onto the screen in our free tool.</text>
      <rect x="20" y="180" width="245" height="110" rx="8" fill="#062e24" stroke="${ACCENT_GREEN}" stroke-width="1"/>
      <text x="32" y="208" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_GREEN}">LOCAL PROCESSING:</text>
      <text x="32" y="232" font-family="sans-serif" font-size="12" fill="#d1fae5">• Zero upload to the cloud</text>
      <text x="32" y="252" font-family="sans-serif" font-size="12" fill="#d1fae5">• GPS purged in browser</text>
      <text x="32" y="272" font-family="sans-serif" font-size="12" fill="#d1fae5">• Sensitive EXIF removed</text>
      <text x="20" y="325" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Processes in seconds via local JavaScript on phone or PC.</text>
    </g>

    <path d="M 680 430 L 700 430" stroke="${ACCENT_GREEN}" stroke-width="3" stroke-linecap="round"/>

    <!-- Step 3 -->
    <g transform="translate(710, 210)">
      <rect width="285" height="460" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow3En)"/>
      <circle cx="45" cy="45" r="22" fill="#27272a" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <text x="39" y="52" font-family="monospace" font-size="18" font-weight="800" fill="${ACCENT_YELLOW}">3</text>
      <text x="80" y="42" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT_MUTED}">STEP 3</text>
      <text x="80" y="60" font-family="sans-serif" font-size="16" font-weight="700" fill="${TEXT}">Clean Download</text>
      <line x1="20" y1="85" x2="265" y2="85" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="20" y="120" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Save Sanitized Image</text>
      <text x="20" y="145" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Download the clean file with pure image pixels preserved.</text>
      <rect x="20" y="180" width="245" height="110" rx="8" fill="#18181b" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="32" y="208" font-family="sans-serif" font-size="12" font-weight="700" fill="${TEXT}">OUTPUT FORMAT OPTIONS:</text>
      <text x="32" y="232" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">• Default Output (Lossless)</text>
      <text x="32" y="252" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">• Or JPG, PNG, WebP, AVIF</text>
      <text x="32" y="272" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">• Or all bundled in a .ZIP</text>
      <text x="20" y="325" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">You can inspect in Metadata Viewer to confirm zero GPS.</text>
    </g>

    <path d="M 1005 430 L 1025 430" stroke="${ACCENT_YELLOW}" stroke-width="3" stroke-linecap="round"/>

    <!-- Step 4 -->
    <g transform="translate(1035, 210)">
      <rect width="285" height="460" rx="12" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" filter="url(#shadow3En)"/>
      <circle cx="45" cy="45" r="22" fill="#1e3a8a" stroke="${ACCENT_BLUE}" stroke-width="1.5"/>
      <text x="39" y="52" font-family="monospace" font-size="18" font-weight="800" fill="${ACCENT_BLUE}">4</text>
      <text x="80" y="42" font-family="sans-serif" font-size="12" font-weight="700" fill="${ACCENT_BLUE}">STEP 4 (FINAL)</text>
      <text x="80" y="60" font-family="sans-serif" font-size="16" font-weight="700" fill="${TEXT}">Document Dispatch</text>
      <line x1="20" y1="85" x2="265" y2="85" stroke="${CARD_BORDER}" stroke-width="1"/>
      <text x="20" y="120" font-family="sans-serif" font-size="14" font-weight="600" fill="${TEXT}">WhatsApp or Telegram</text>
      <text x="20" y="145" font-family="sans-serif" font-size="13" fill="${TEXT_MUTED}">Attach the clean file via Document menu with zero anxiety.</text>
      <rect x="20" y="180" width="245" height="110" rx="8" fill="#0f284d" stroke="${ACCENT_BLUE}" stroke-width="1"/>
      <text x="32" y="208" font-family="sans-serif" font-size="12" font-weight="700" fill="#60a5fa">PERFECT RESULT:</text>
      <text x="32" y="232" font-family="sans-serif" font-size="12" fill="#bfdbfe">✓ 100% optical sharpness</text>
      <text x="32" y="252" font-family="sans-serif" font-size="12" fill="#bfdbfe">✓ Zero app compression</text>
      <text x="32" y="272" font-family="sans-serif" font-size="12" fill="#bfdbfe">✓ Zero leaked coordinates</text>
      <text x="20" y="325" font-family="sans-serif" font-size="12" fill="${TEXT_MUTED}">Guaranteed peace of mind for you and your family.</text>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(path.join(outDir, 'safe-photo-sharing-workflow.jpg'));
}

async function run() {
  console.log('Generating Portuguese and English blog infographic diagrams...');
  await generateComparisonPt();
  await generateInspectionPt();
  await generateWorkflowPt();
  console.log('✓ Portuguese diagrams generated');

  await generateComparisonEn();
  await generateInspectionEn();
  await generateWorkflowEn();
  console.log('✓ English diagrams generated');
}

run().catch(console.error);

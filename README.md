# EEL882 COMPUTAÇÃO GRÁFICA - Trabalho 3 (UFRJ 2019.1)

## Instruções de instalação

1. Clonar o repositório localmente: `git clone https://github.com/ramonduarte/cgtrab3.git`.
2. Utilizar um servidor HTTP para o arquivo `index.html`. Caso `python3` esteja disponível, uma opção simples é usar o comando `python3 -m http.server` na pasta raiz do projeto.
3. Abrir num navegador web compatível com WebGL. O projeto foi testado no Google Chrome 64-bits.

## Modos de uso

1. A seleção dos modos dá-se pelo menu no canto superior, à esquerda.
2. No modo `ROTATE` (selecionado por padrão), as peças podem ser rotacionadas individualmente clicando sobre elas. Uma esfera vermelha indica qual peça está selecionada. Todas as peças podem ser selecionadas com um duplo clique sobre o _background_. Neste caso, uma esfera azul aparecerá como indicador. Cliques simples sobre o _background_ ou mudança de modo provocarão a desseleção das peças.
3. No modo `DRAG`, peças individuais podem ser arrastadas sobre o _background_. As peças não colidem entre si.
4. No modo `DELETE`, as peças clicadas serão removidas da cena. Não há como desfazer esta operação.
5. A câmera suporta as seguintes operações: _zoom in_/_zoom out_ utilizando a rodinha do mouse (_scroll_) e _panning_ horizontal e vertical utilizando o botão direito do mouse. OBS: o uso do _panning_ é registrado como clique e provocará a desseleção das peças em rotação.

# projectState.js

1) updateAvailableComponents

Preciso trazer a função fillLayoutWithComponentsMocked do arquivo renderView.js para cá. A ideia é que a chamada à API futura seja diretamente no estado, e não na view. Atualmente,  da forma que está implementado, a interface é atualizada antes do estado ser modificado. Ou seja, o estado está refletindo a interface, e não o contrário.

2) 'form:inputChanged' é o caso onde o valor a ser armazenado no estado depende completamente da interface. Nesse caso, a ação deve continuar sendo disparada pela view, mas a lógica de atualização do estado deve ser transferida para o estado.



Qual o caminho esperado?

- Sistema inicia.
- projectState.js preenche a interface com os valores iniciais de cada campo.
    -> preenche os inputs de texto com valores default.
    -> preenche selects de cores com os valores default.
    -> preenche a seção de componentes com os componentes mockados.

    [Se eu carregar todos os arquivos de uma vez, não precisarei disparar novas requisições para as mudaças de versões e modelos.]

- Usuário interage com a interface.
    -> Usuário altera o valor de um input de texto.
    -> A view dispara a ação 'form:inputChanged' com o novo valor.
    -> projectState.js atualiza o estado com o novo valor.

- Usuário interage com as cores.
    -> Usuário seleciona uma nova cor em um select.
    -> A view dispara a ação 'form:colorChanged' com a nova cor.
    -> projectState.js atualiza o estado com a nova cor.

- Usuário interage com a seção de componentes.
    -> Usuário ativa um componente.
    -> A view dispara a ação 'component:valueChanged' com todas as informações do componente.
    -> projectState.js atualiza o estado com as informações do componente.
    - O Shadow DOM é atualizado automaticamente com base no estado.



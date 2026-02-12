export const formConfig = {
  sections: [
    {
      id: "general-info",
      title: "1. Informações Gerais",
      type: "text-inputs",
      fields: [
        {
          id: "course-name",
          label: "Nome do Curso",
          type: "text",
          required: true,
          placeholder: "",
        },
        {
          id: "course-time",
          label: "Carga Horária",
          type: "text",
          placeholder: "Ex: 40h",
        },
        {
          id: "course-encapsulation-class",
          label: "Classe de Encapsulamento",
          type: "text",
          placeholder: "Ex: CursoAlunoX",
        },
      ],
    },
    {
      id: "visual-identity",
      title: "2. Identidade Visual",
      type: "color-scheme",
      hint: {
        icon: "info",
        text: "<strong>Interação:</strong> Clique em qualquer cartão para colar o código Hex da sua área de transferência.",
      },
      groups: [
        {
          id: "base",
          title: "Base",
          colors: [
            {
              var: "base1-light",
              label: "Base 1 Light",
              field: "base1-light",
              default: "#014ff1",
            },
            {
              var: "base1-dark",
              label: "Base 1 Dark",
              field: "base1-dark",
              default: "#013ebc",
            },
            {
              var: "base2-light",
              label: "Base 2 Light",
              field: "base2-light",
              default: "#338fe5",
            },
            {
              var: "base2-dark",
              label: "Base 2 Dark",
              field: "base2-dark",
              default: "#1a76cc",
            },
          ],
        },
        {
          id: "intermediate-1",
          title: "Intermediária 1",
          colors: [
            {
              var: "intermediaria1-light",
              label: "Int 1 Light",
              field: "intermediaria1-light",
              default: "#00b0c1",
            },
            {
              var: "intermediaria1-dark",
              label: "Int 1 Dark",
              field: "intermediaria1-dark",
              default: "#00828f",
            },
            {
              var: "intermediaria1-background-light",
              label: "Int 1 Bg Light",
              field: "intermediaria1-bg-light",
              default: "#00dff5",
            },
            {
              var: "intermediaria1-background-dark",
              label: "Int 1 Bg Dark",
              field: "intermediaria1-bg-dark",
              default: "#00b1c2",
            },
          ],
        },
        {
          id: "intermediate-2",
          title: "Intermediária 2",
          colors: [
            {
              var: "intermediaria2-light",
              label: "Int 2 Light",
              field: "intermediaria2-light",
              default: "#d0d0d0",
            },
            {
              var: "intermediaria2-dark",
              label: "Int 2 Dark",
              field: "intermediaria2-dark",
              default: "#3a3a3a",
            },
            {
              var: "intermediaria2-background-light",
              label: "Int 2 Bg Light",
              field: "intermediaria2-bg-light",
              default: "#c5c5c5",
            },
            {
              var: "intermediaria2-background-dark",
              label: "Int 2 Bg Dark",
              field: "intermediaria2-bg-dark",
              default: "#404040",
            },
          ],
        },
        {
          id: "intermediate-3",
          title: "Intermediária 3",
          colors: [
            {
              var: "intermediaria3-light",
              label: "Int 3 Light",
              field: "intermediaria3-light",
              default: "#b0b0b0",
            },
            {
              var: "intermediaria3-dark",
              label: "Int 3 Dark",
              field: "intermediaria3-dark",
              default: "#4d4d4d",
            },
            {
              var: "intermediaria3-background-light",
              label: "Int 3 Bg Light",
              field: "intermediaria3-bg-light",
              default: "#a5a5a5",
            },
            {
              var: "intermediaria3-background-dark",
              label: "Int 3 Bg Dark",
              field: "intermediaria3-bg-dark",
              default: "#555555",
            },
          ],
        },
        {
          id: "active-states",
          title: "Active & Hover",
          colors: [
            {
              var: "active-light",
              label: "Active Light",
              field: "active-light",
              default: "#007bff",
            },
            {
              var: "active-dark",
              label: "Active Dark",
              field: "active-dark",
              default: "#0056b3",
            },
            {
              var: "active-hover-light",
              label: "Hover Light",
              field: "active-hover-light",
              default: "#0056b3",
            },
            {
              var: "active-hover-dark",
              label: "Hover Dark",
              field: "active-hover-dark",
              default: "#003d82",
            },
          ],
        },
      ],
    },
    {
      id: "assets",
      title: "3. Assets do Projeto",
      type: "file-upload",
      hint: {
        text: "Selecione as imagens dos cards do projeto.",
      },
      uploadZone: {
        id: "cardImages",
        accept: "image/*",
        multiple: true,
        maxFiles: 15,
        icon: "upload",
        label: "Clique para selecionar imagens",
        subLabel: "Máximo 15 imagens",
      },
    },
    {
      id: "components",
      title: "4. Componentes do Projeto",
      type: "component-builder",
      hint: {
        text: "Configure seus componentes aqui.",
      },
      layout: {
        type: "two-panel",
        leftPanel: {
          id: "components-section",
          class: "components-section",
        },
        rightPanel: {
          preview: {
            id: "preview",
            modes: ["light", "dark"],
          },
          codeEditor: {
            tabs: ["html", "css", "js"],
          },
        },
      },
    },
  ],
};

//! $ es lo mismo que document.addEventLister("DOMContentLoaded...")
//! Eso porque es de JQuery.
$(function () {
  //!Aquí el dolar también sirve como selector.
  //! document.querySelector("#navbarToggle").addEventLister("blur...
  //* navbarToggle es el id del botón.
  //* Blur es cuando pierde el foco un elemento.
  //* Entonces cuando se desenfoque, se activará ese listener.
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      //! Otra vez un select. Recodar que es porque estamos usando cosas de JQuery.
      //* Este es el id de todo nuestro menú. La lista.
      $("#collapsable-nav").collapse("hide");
    }
  });

  // In Firefox and Safari, the click event doesn't retain the focus
  // on the clicked button. Therefore, the blur event will not fire on
  // user clicking somewhere else in the page and the blur event handler
  // which is set up above will not be called.
  // Refer to issue #28 in the repo.
  // Solution: force focus on the element that the click event fired on
  //! Evento de clic es asegurarse de que el botón tenga el foco después de que el usuario haga clic en él.
  //! Es como para forzarlo. Al parecer toca usarlo para que funcione también en celulares y algunso navegadores.
  $("#navbarToggle").click(function (event) {
    $(event.target).focus(); //! Forzamos el focus al darle click en él.
  });
});

//! Función para cargar el main content.
(function (global) {
  var dc = {};

  var homeHtml = "snippets/home-snippet.html";
  var allCategoriesURL =
    "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
  var categoriesTitleHTML = "snippets/categories-title-snippet.html";
  var categoryHTML = "snippets/category-snippet.html";

  // Convinience function for inserting innerHTML for 'select'.
  var insertHtml = function (selector, html) {
    var targetElement = document.querySelector(selector);
    targetElement.innerHTML = html;
  };

  // Show loading icon inside element identified by 'selector'.
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  /**
   * !La letra "g" se utiliza en la expresión regular como una "bandera" o "flag" para indicar
   * !que se debe buscar todas las ocurrencias de la cadena que coinciden con el patrón en lugar de
   * !solo la primera ocurrencia.
   * */
  // Return substitute of '{{propname}} with propValue is given 'string'.
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    string = string.replace(
      new RegExp(propToReplace, "g", propValue),
      propValue
    );
    return string;
  };

  // On page load (before images or CSS).
  document.addEventListener("DOMContentLoaded", function (event) {
    showLoading("#main-content");
    //homeHtml sería la url. Recordar el parámetro.
    $ajaxUtils.sendGetRequest(
      homeHtml,
      function (responseText) {
        document.querySelector("#main-content").innerHTML = responseText;
      },
      false
    );
  });

  dc.loadMenuCategories = function () {
    // Mientras cargan los recursos en caso de que sea lento, se mostrará el loading gif.
    showLoading("#main-content");
    //! No se le pasó ni true ni false porque por defecto es jason ya que vamos a sacar los elementos del link externo de la API.
    $ajaxUtils.sendGetRequest(allCategoriesURL, buildAndShowCategoriesHTML);
  };

  // Categories sería "responseHandler(JSON.parse(request.responseText));". O sea lo del argumento. Eso es del ajax.
  // Es similar a lo que ya había hecho antes. Aquí nada más se da por hecho que categories es ese parámetro que se definió antes.
  function buildAndShowCategoriesHTML(categories) {
    // Load title snippet of categories page.
    //! Si no me equivoco se hace mejor una dentro de la otra porque estamos trabajando con ajax y es asincrónico.
    $ajaxUtils.sendGetRequest(
      categoriesTitleHTML,
      function (categoriesTitle) {
        //! OJO: este categoriesTitleHTML aquí adentro sería otra cosa. Creo que era mejor si se cambiaba un poco el nombre.
        //! Mejor le cambié el nombre para poder diferencialos bien. Cualquier cosa revisar el source code.
        //! También modifiqué lo de categoryHTML. Uno con '_' y otro sin. Así los diferencio mejor.
        // Retrieve single category snippet.
        $ajaxUtils.sendGetRequest(
          categoryHTML,
          function (category_HTML) {
            //* Una vez tenemos todos los elementos, ya podemos empezar a unir cada cosa del html.
            var categoriesViewHTML = buildCategoriesViewHTML(
              categories,
              categoriesTitle,
              category_HTML
            );
            insertHtml("#main-content", categoriesViewHTML);
          },
          false
        );
      },
      false
    );
  }

  function buildCategoriesViewHTML(
    categories,
    categoriesTitleHTML,
    categoryHTML
  ) {
    var finalHTML = categoriesTitleHTML;
    finalHTML += "<section class='row'>";

    // Loop for categories.
    for (var i = 0; i < categories.length; i++) {
      // Insert category values.
      var html = categoryHTML;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;
      // Es como un replace. Es la función que hicimos arriba.
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);

      finalHTML += html;
    }

    finalHTML += "</section>";
    return finalHTML;
  }

  global.$dc = dc;
})(window);

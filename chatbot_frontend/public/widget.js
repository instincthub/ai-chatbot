(function () {
  // Configuration
  const config = {
    widgetId: "WIDGET_ID", // Will be replaced when script is generated
    baseUrl: "WIDGET_BASE_URL", // Will be replaced when script is generated
  };

  // Create widget container
  function createWidget() {
    // Create widget container
    const container = document.createElement("div");
    container.id = "support-chatbot-widget-container";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";

    // Create widget iframe
    const iframe = document.createElement("iframe");
    iframe.id = "support-chatbot-widget-iframe";
    iframe.src = `${config.baseUrl}/widget/${config.widgetId}`;
    iframe.style.border = "none";
    iframe.style.width = "350px";
    iframe.style.height = "500px";
    iframe.style.borderRadius = "10px";
    iframe.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
    iframe.style.display = "none";

    // Create toggle button
    const button = document.createElement("button");
    button.id = "support-chatbot-widget-button";
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
      </svg>
    `;
    button.style.width = "60px";
    button.style.height = "60px";
    button.style.borderRadius = "50%";
    button.style.backgroundColor = "#2563EB";
    button.style.color = "white";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";

    // Toggle widget visibility on button click
    button.addEventListener("click", function () {
      if (iframe.style.display === "none") {
        iframe.style.display = "block";
        button.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
          </svg>
        `;
      } else {
        iframe.style.display = "none";
        button.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
          </svg>
        `;
      }
    });

    // Append elements to container
    container.appendChild(iframe);
    container.appendChild(button);

    // Append container to body
    document.body.appendChild(container);
  }

  // Initialize widget
  function init() {
    if (document.readyState === "complete") {
      createWidget();
    } else {
      window.addEventListener("load", createWidget);
    }
  }

  // Start initialization
  init();
})();

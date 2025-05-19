const apiKey = "55562c81dd39bc3d919ff140f3e967bb";

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const weatherBox = document.getElementById("weatherResult");
  const forecastScroll = document.getElementById("forecastScroll");

  if (!city) return;

  weatherBox.style.display = "none";
  forecastScroll.innerHTML = "";

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) throw new Error();

      weatherBox.innerHTML = `
        <div class="weather-city">${data.name}</div>
        <div class="weather-main">
          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Ícone" />
          <div>${Math.round(data.main.temp)}°C</div>
        </div>
        <div class="weather-info">
          <div data-emoji="💧">${data.main.humidity}%</div>
          <div data-emoji="💨">${Math.round(data.wind.speed * 3.6)} km/h</div>
        </div>
      `;

      weatherBox.style.display = "flex";
    })
    .catch(() => {
      weatherBox.innerHTML = "Erro ao buscar a previsão. Tente novamente.";
      weatherBox.style.display = "block";
    });

  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== "200") throw new Error();

      const days = {};
      data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!days[date]) days[date] = [];
        days[date].push(item);
      });

      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const today = new Date().toISOString().split("T")[0];

      const preferredHours = ["12:00:00", "15:00:00", "09:00:00", "18:00:00", "06:00:00", "21:00:00"];

      let countDays = 0;

      for (const date of Object.keys(days)) {
        if (date === today) continue;
        if (countDays >= 5) break;

        const dayItems = days[date];
        if (!dayItems || dayItems.length === 0) continue;

        // Função para achar o melhor item para o dia
        function findBestItem() {
          for (const hour of preferredHours) {
            const found = dayItems.find(item => item.dt_txt.endsWith(hour));
            if (found && found.weather && found.weather[0] && found.weather[0].icon && !found.weather[0].icon.startsWith("50")) {
              return found;
            }
          }
          // fallback para qualquer item com ícone válido
          const validItem = dayItems.find(item => item.weather && item.weather[0] && item.weather[0].icon);
          return validItem || dayItems[0];
        }

        const chosenItem = findBestItem();

        // Verifica se o ícone existe e é válido, senão usa um ícone padrão (ex: "01d" = sol)
        let icon = "01d";
        if (chosenItem && chosenItem.weather && chosenItem.weather[0] && chosenItem.weather[0].icon) {
          icon = chosenItem.weather[0].icon;
        }

        const temp = chosenItem && chosenItem.main ? Math.round(chosenItem.main.temp) : "-";

        const [year, month, day] = date.split("-");
        const monthName = months[parseInt(month, 10) - 1];

        const dayDiv = document.createElement("div");
        dayDiv.className = "forecast-day";
        dayDiv.innerHTML = `
          <div class="date-day">${day}</div>
          <div class="date-month">${monthName}</div>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Ícone do tempo" />
          <div>${temp}°C</div>
        `;

        forecastScroll.appendChild(dayDiv);
        countDays++;
      }

      if (countDays === 0) {
        forecastScroll.innerHTML = "<p style='opacity:0.5;text-align:center'>Previsão não disponível.</p>";
      }
    })
    .catch(() => {
      forecastScroll.innerHTML = "";
    });
}

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const weatherBox = document.getElementById("weatherResult");
  const forecastScroll = document.getElementById("forecastScroll");

  if (!city) return;

  weatherBox.style.display = "block"; 
  forecastScroll.innerHTML = "";
  weatherBox.innerHTML = "Buscando...";

  fetch(`/api/getWeather?city=${encodeURIComponent(city)}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Erro na resposta da API local');
      }
      return res.json();
    })
    .then(apiData => {

      const data = apiData.weather;
      if (data.cod !== 200) {
        throw new Error(data.message || 'Cidade não encontrada');
      }

      let mainIcon = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Ícone" />`;
      if (data.weather[0].id === 800) {
        const hour = new Date().getHours();
        mainIcon = hour >= 6 && hour < 18 ? "☀️" : "🌙";
      }

      const nowUTC = new Date();
      const localTimestamp = nowUTC.getTime() + (nowUTC.getTimezoneOffset() * 60000) + (data.timezone * 1000);
      const localDate = new Date(localTimestamp);
      const localHourStr = localDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      weatherBox.innerHTML = `
        <div class="weather-city">${data.name}</div>
        <div class="weather-main">
          ${mainIcon}
          <div>${Math.round(data.main.temp)}°C</div>
          <div class="forecast-hour">${localHourStr}</div>
        </div>
        <div class="weather-info">
          <div>
            <img src="assets/icons/1f4a7.svg" alt="Gota" style="width:1em;height:1em;vertical-align:middle" />
            ${data.main.humidity}%
          </div>
          <div>
            <img src="assets/icons/1f4a8.svg" alt="Vento" style="width:1em;height:1em;vertical-align:middle" />
            ${Math.round(data.wind.speed * 3.6)} km/h
          </div>
        </div>
      `;
      weatherBox.style.display = "flex";

      const forecastData = apiData.forecast;
      if (forecastData.cod !== "200") throw new Error('Erro no forecast');

      const days = {};
      forecastData.list.forEach(item => {
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

         function findBestItem() {
           for (const hour of preferredHours) {
             const found = dayItems.find(item => item.dt_txt.endsWith(hour));
             if (found && found.weather && found.weather[0] && found.weather[0].icon && !found.weather[0].icon.startsWith("50")) {
               return found;
             }
           }
           const validItem = dayItems.find(item => item.weather && item.weather[0] && item.weather[0].icon);
           return validItem || dayItems[0];
         }

         const chosenItem = findBestItem();
         // ... (continua a lógica do loop) ...
         let icon = "01d";
         let mainIcon = `<img src="https://openweathermap.org/img/wn/01d@2x.png" alt="Ícone do tempo" />`;
         if (chosenItem && chosenItem.weather && chosenItem.weather[0]) {
           icon = chosenItem.weather[0].icon;
           if (chosenItem.weather[0].id === 800) {
             const forecastHour = parseInt(chosenItem.dt_txt.split(" ")[1].split(":")[0], 10);
             mainIcon = forecastHour >= 6 && forecastHour < 18 ? "☀️" : "🌙";
           } else {
             mainIcon = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Ícone do tempo" />`;
           }
         }
         // ...
         const problematicIcons = ["50d", "50n", undefined, null, ""];
         if (problematicIcons.includes(icon)) {
           mainIcon = `<img src="assets/icons/question.svg" alt="Ícone do tempo" />`;
         }
         
         const temp = chosenItem && chosenItem.main ? Math.round(chosenItem.main.temp) : "-";
         
         let localHour = `<div class="forecast-hour">--:--</div>`;
         if (chosenItem && chosenItem.dt_txt) {
           const hourStr = chosenItem.dt_txt.split(" ")[1].slice(0,5);
           localHour = `<div class="forecast-hour">${hourStr}</div>`;
         }
         
         const [year, month, day] = date.split("-");
         const monthName = months[parseInt(month, 10) - 1];
         
         const dayDiv = document.createElement("div");
         dayDiv.className = "forecast-day";
         dayDiv.innerHTML = `
           <div class="date-day">${day}</div>
           <div class="date-month">${monthName}</div>
           ${mainIcon}
           <div class="forecast-temp">${temp}°C</div>
         `;
         
         forecastScroll.appendChild(dayDiv);
         countDays++;
      }

      if (countDays === 0) {
        forecastScroll.innerHTML = "<p style='opacity:0.5;text-align:center'>Previsão não disponível.</p>";
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar previsão:", error);
      weatherBox.innerHTML = `Erro: ${error.message || 'Não foi possível buscar a previsão'}.`;
      weatherBox.style.display = "block";
      forecastScroll.innerHTML = "";
    });
}

export default async function handler(req, res) {
  const { city } = req.query;

  const apiKey = process.env.API_KEY;

  if (!city) {
    return res.status(400).json({ error: 'Cidade é obrigatória' });
  }

  try {
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`);
    const weatherData = await weatherResponse.json();

    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`);
    const forecastData = await forecastResponse.json();

    res.status(200).json({
      weather: weatherData,
      forecast: forecastData
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do tempo' });
  }
}

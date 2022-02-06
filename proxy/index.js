const { log, error } = console;
const express = require('express');
const app = express();
const server = app.listen(3000, log('Proxy server is running on port 3000'));
const got = require('got');
const cors = require('cors');

//Tulind Functions
const {
  sma_inc,
  ema_inc,
  markers_inc,
  rsi_inc,
  macd_inc,
} = require('./indicators');

app.use(cors());
app.get('/:symbol/:interval', async (req, res) => {
  try {
    const { symbol, interval } = req.params;
    const resp = await got(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`
    );
    const data = JSON.parse(resp.body);
    let klinedata = data.map((d) => ({
      time: d[0] / 1000,
      open: d[1] * 1,
      high: d[2] * 1,
      low: d[3] * 1,
      close: d[4] * 1,
    }));
    klinedata = await sma_inc(klinedata);
    klinedata = await ema_inc(klinedata);
    klinedata = markers_inc(klinedata);
    klinedata = await rsi_inc(klinedata);
    klinedata = await macd_inc(klinedata);
    res.status(200).json(klinedata);
  } catch (err) {
    res.status(500).send(err);
  }
});

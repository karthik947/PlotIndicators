const { log, error } = console;

const getData = async () => {
  const resp = await fetch('http://127.0.0.1:3000/BTCUSDT/1m');
  const data = await resp.json();
  return data;
};

// getData();

const renderChart = async () => {
  const chartProperties = {
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
    },
    pane: 0,
  };
  const domElement = document.getElementById('tvchart');
  const chart = LightweightCharts.createChart(domElement, chartProperties);
  const candleseries = chart.addCandlestickSeries();
  const klinedata = await getData();
  candleseries.setData(klinedata);
  //SMA
  const sma_series = chart.addLineSeries({ color: 'red', lineWidth: 1 });
  const sma_data = klinedata
    .filter((d) => d.sma)
    .map((d) => ({ time: d.time, value: d.sma }));
  sma_series.setData(sma_data);
  //EMA
  const ema_series = chart.addLineSeries({ color: 'green', lineWidth: 1 });
  const ema_data = klinedata
    .filter((d) => d.ema)
    .map((d) => ({ time: d.time, value: d.ema }));
  ema_series.setData(ema_data);
  //MARKERS
  candleseries.setMarkers(
    klinedata
      .filter((d) => d.long || d.short)
      .map((d) =>
        d.long
          ? {
              time: d.time,
              position: 'belowBar',
              color: 'green',
              shape: 'arrowUp',
              text: 'LONG',
            }
          : {
              time: d.time,
              position: 'aboveBar',
              color: 'red',
              shape: 'arrowDown',
              text: 'SHORT',
            }
      )
  );
  //RSI
  const rsi_series = chart.addLineSeries({
    color: 'purple',
    lineWidth: 1,
    pane: 1,
  });
  const rsi_data = klinedata
    .filter((d) => d.rsi)
    .map((d) => ({ time: d.time, value: d.rsi }));
  rsi_series.setData(rsi_data);
  //MACD FAST
  const macd_fast_series = chart.addLineSeries({
    color: 'blue',
    lineWidth: 1,
    pane: 2,
  });
  const macd_fast_data = klinedata
    .filter((d) => d.macd_fast)
    .map((d) => ({ time: d.time, value: d.macd_fast }));
  macd_fast_series.setData(macd_fast_data);
  //MACD SLOW
  const macd_slow_series = chart.addLineSeries({
    color: 'red',
    lineWidth: 1,
    pane: 2,
  });
  const macd_slow_data = klinedata
    .filter((d) => d.macd_slow)
    .map((d) => ({ time: d.time, value: d.macd_slow }));
  macd_slow_series.setData(macd_slow_data);
  //MACD HISTOGRAM //
  const macd_histogram_series = chart.addHistogramSeries({
    pane: 2,
  });
  const macd_histogram_data = klinedata
    .filter((d) => d.macd_histogram)
    .map((d) => ({
      time: d.time,
      value: d.macd_histogram,
      color: d.macd_histogram > 0 ? 'green' : 'red',
    }));
  macd_histogram_series.setData(macd_histogram_data);
  //SUPPORT / RESISTANCE LINES
  const resistanceLine = candleseries.createPriceLine({
    price: 40400,
    color: 'red',
    lineWidth: 2,
    lineStyle: LightweightCharts.LineStyle.Solid,
    title: 'Resistance Line',
  });
  const supportLine = candleseries.createPriceLine({
    price: 39800,
    color: 'green',
    lineWidth: 2,
    title: 'Support Line',
  });
  //OHLC VALUES
  chart.subscribeCrosshairMove((param) => {
    const ohlc = param.seriesPrices.get(candleseries);
    const rsi = param.seriesPrices.get(rsi_series);
    renderOHLC(ohlc);
    renderRSI(rsi);
  });
  //CONDITIONAL BACKGROUND
  const conditional_bgd_series = chart.addHistogramSeries({
    pane: 0,
    lineWidth: 0,
    priceScaleId: 'cpcid1',
    base: 1,
  });
  const conditional_bdg_data = klinedata.map((d, i) =>
    i < 100
      ? { time: d.time, value: 0, color: 'rgba(255, 0, 0, 0.1)' }
      : i < 200
      ? { time: d.time, value: 0, color: 'rgba(0, 255, 0, 0.1)' }
      : { time: d.time, value: 0, color: 'rgba(255, 0, 0, 0)' }
  );
  conditional_bgd_series.setData(conditional_bdg_data);
  chart
    .priceScaleId('cpcid1')
    .applyOptions({ scaleMargin: { bottom: 0, top: 0 } });
};

const renderOHLC = (d) => {
  const { open, high, low, close } = d;
  const markup = `<p>O<span class="${
    open > close ? 'red' : 'green'
  }">${open}</span> H<span class="${
    open > close ? 'red' : 'green'
  }">${high}</span> L<span class="${
    open > close ? 'red' : 'green'
  }">${low}</span> C<span class="${
    open > close ? 'red' : 'green'
  }">${close}</span> </p>`;
  document.getElementById('ohlc').innerHTML = markup;
};

const renderRSI = (d) => {
  const markup = `<p>RSI: ${d.toFixed(2)}</p>`;
  document.getElementById('rsi').innerHTML = markup;
};

renderChart();

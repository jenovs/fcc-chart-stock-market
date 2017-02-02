const tickerBox = (ticker = '', price = '', name = '&nbsp;') => `
  <div class="ticker-title">
    <div class="ticker-symb">${ticker}</div>
    <div class="ticker-price">${price ? '$' : ''}${price}</div>
    <div class="ticker-delete">X</div>
  </div>
  <div class="ticker-descr">
    ${name.replace(/ Prices, Dividends, Splits and Trading Volume/, '')}
  </div>
`

export default tickerBox;

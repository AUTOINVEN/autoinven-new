// 미국 환율 조회
const getUSDExchangeRate = () => {
  const db = require('$base/models');

  let rate_result = null;

  (async () => {
    rate_result = await db.ExchangeRate.findByPk('USD');

    if (!rate_result) {
      throw new Error('ExcangeRate Not Found');
    }
  })();

  return rate_result.deal_bas_r;
};

/*let rate = null;
(async () => {
  rate = await getUSDExchangeRate();
})();*/

// 언어에 맞는 임대료 반환
module.exports = (locale, rent) => {
  if (!rent) {
    return null;
  } else {
    if (locale === 'en') {
      const rate = getUSDExchangeRate();
      return parseFloat((rent / rate).toFixed(2));
    } else {
      return rent;
    }
  }
};

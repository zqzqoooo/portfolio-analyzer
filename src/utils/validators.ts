import type { FormState, FormErrors, Stock } from '../types';

export function validateStockForm(data: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!data.code?.trim()) {
    errors.code = '请输入股票代码';
  } else {
    const code = data.code.trim();
    const market = data.market;
    
    if (market === 'CN' && !/^\d{6}$/.test(code)) {
      errors.code = 'A股代码必须是6位数字';
    } else if (market === 'HK' && !/^\d{4,5}$/.test(code)) {
      errors.code = '港股代码必须是4-5位数字';
    } else if (market === 'US' && !/^[A-Z]{1,5}$/i.test(code)) {
      errors.code = '美股代码必须是1-5位字母';
    }
  }

  if (!data.buyPrice) {
    errors.buyPrice = '请输入买入价格';
  } else if (parseFloat(data.buyPrice) <= 0) {
    errors.buyPrice = '买入价格必须大于0';
  }

  if (!data.quantity) {
    errors.quantity = '请输入持仓数量';
  } else if (parseInt(data.quantity, 10) <= 0) {
    errors.quantity = '持仓数量必须大于0';
  } else if (!Number.isInteger(parseFloat(data.quantity))) {
    errors.quantity = '持仓数量必须是整数';
  }

  if (!data.buyDate) {
    errors.buyDate = '请选择买入日期';
  } else {
    const buyDate = new Date(data.buyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (buyDate > today) {
      errors.buyDate = '买入日期不能晚于今天';
    }
  }

  if (data.currentPrice && parseFloat(data.currentPrice) <= 0) {
    errors.currentPrice = '当前价格必须大于0';
  }

  return errors;
}

export function validateStockData(stock: Partial<Stock>): boolean {
  if (!stock.code || !stock.market || !stock.buyPrice || !stock.quantity || !stock.buyDate) {
    return false;
  }
  
  if (stock.buyPrice <= 0 || stock.quantity <= 0) {
    return false;
  }
  
  return true;
}

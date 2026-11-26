const NUM = new Intl.NumberFormat('es-MX')

export const entero = (n: number): string => NUM.format(n)

export const decimal = (n: number, digitos = 2): string =>
  n.toLocaleString('es-MX', { minimumFractionDigits: digitos, maximumFractionDigits: digitos })

export const porcentaje = (n: number, digitos = 1): string => `${decimal(n, digitos)} %`

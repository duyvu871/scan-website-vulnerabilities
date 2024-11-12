export const resolveCountryFlag = (country: string, theme: 'shiny'| 'flat', size: '16'|'24'|'32'|'48'|'64') => {
    const currentOrigin = window.location.origin;
    return `${currentOrigin}/countries-flags/${(country || "VN").toLowerCase()}.png`
}
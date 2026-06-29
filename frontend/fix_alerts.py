content = open('js/main.js', 'r', encoding='utf-8').read()

# Fix 1: cart page checkout button (backtick template literal)
old1 = "      alert(`\u00a1Gracias por tu compra! \U0001f389\\n\\nTotal: ${total.toFixed(2)}\\n\\n(Simulaci\u00f3n \u2014 pasarela de pago no implementada)`);"
new1 = "      window.location.href = 'checkout.html';"

# Fix 2: floating cart checkout button (single quote string)
old2 = "      alert('\u00a1Gracias por tu compra! \U0001f389\\n\\n(Simulaci\u00f3n \u2014 pasarela de pago no implementada)');"
new2 = "      window.location.href = 'checkout.html';"

c1 = content.replace(old1, new1)
c2 = c1.replace(old2, new2)

open('js/main.js', 'w', encoding='utf-8').write(c2)

changed1 = old1 not in c2
changed2 = old2 not in c2
print(f"Fix1 applied: {changed1}, Fix2 applied: {changed2}")

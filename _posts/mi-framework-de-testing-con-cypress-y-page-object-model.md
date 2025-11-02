---
title: Mi Framework de Testing con Cypress y Page Object Model
category: programacion
date: 2025-11-01T23:24:30.441Z
featured_image: /img/2.jpg
excerpt: Implementación de un framework de testing automatizado con Cypress,
  TypeScript y Page Object Model para pruebas escalables y mantenibles.
---
# Mi Framework de Testing con Cypress y Page Object Model

# Después del taller de Pinnacle Aerospace, implementé un framework de testing automatizado usando Cypress con TypeScript y Page Object Model (POM). Aquí explico mi arquitectura:

## 🏗️ Arquitectura del Framework

### Page Object Model

Implementé POM para separar la lógica de prueba de los selectores de UI:

````typescript
```typescript
// LoginPage.ts
export class LoginPage {
    private readonly emailInput = "#username";
    private readonly passwordInput = "#password";
    private readonly submitButton = "#loginbtn";

    setEmail(email: string) {
        this.type(this.emailInput, email);
    }

    setPassword(password: string) {
        this.type(this.passwordInput, password);
    }

    clickLogin() {
        this.click(this.submitButton);
    }
}
````

### Patrón de Actions

Creé una capa de acciones reutilizables:

```typescript
// LoginAction.ts
export class LoginAction {
    private loginPage: LoginPage;

    constructor() {
        this.loginPage = new LoginPage();
    }

    loginAs(email: string, password: string) {
        this.loginPage.setEmail(email);
        this.loginPage.setPassword(password);
        this.loginPage.clickLogin();
    }
}
```

## Data-Driven Testing con Fixtures

Implementé fixtures para gestionar datos de prueba:

```typescript
{
    "validUsers": {
        "email": "usuario.valido@itson.edu.mx",
        "password": "password123"
    },
    "invalidUsers": {
        "email": "usuario.invalido",
        "password": "123"
    }
}
```

Y tests que usan estos datos:

```typescript
it('should login with valid credentials', () => {
    cy.fixture('users').then((users) => {
        loginAction.loginAs(users.validUsers.email, users.validUsers.password);
        cy.url().should('include', '/dashboard');
    });
});
```

## 🎯 Beneficios de Esta Arquitectura

1. **Mantenibilidad**: Los cambios en UI solo afectan los Page Objects
2. **Reusabilidad**: Actions pueden ser usadas en múltiples tests
3. **Legibilidad**: Tests son claros y fáciles de entender
4. **Escalabilidad**: Fácil agregar nuevos tests y páginas

## 🚀 Aprendizajes Clave

* **TypeScript** mejora la mantenibilidad del código de testing
* **POM** es esencial para tests a largo plazo
* **Fixtures** permiten testing data-driven sin hardcodear valores
* **Cypress** es increíblemente poderoso para testing moderno de UI

Este framework demuestra habilidades en testing automatizado, arquitectura de software y mejores prácticas de QA.

[Ver código en GitHub](https://github.com/Dan219/cypress_practice)

<!--EndFragment-->
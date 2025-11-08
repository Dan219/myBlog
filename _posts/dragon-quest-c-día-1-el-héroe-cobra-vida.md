---
title: "Dragon Quest C++ - Día 1: El Héroe Cobra Vida"
category: programacion
date: 2025-11-07T03:15:09.129Z
featured_image: /img/123124124124124241.jpg
excerpt: "Primer día de desarrollo serio: desde un Personaje genérico hasta un
  Héroe con habilidades únicas, herencia y un sistema de combate que empieza a
  latir."
---
<!--StartFragment-->

## 🐉 Nace el Héroe

Hoy fue uno de esos días de programación donde las piezas empezaron a encajar. Comenzamos con una clase `Personaje` bastante genérica y terminamos con un **sistema de herencia** funcionando.

### ✅ Lo que Logramos Hoy

**1. Clase Base Sólida**

* `Personaje` ahora tiene sistema de magia (HP/MP)
* Métodos virtuales para polimorfismo
* Stats balanceados para crecimiento

**2. El Héroe Toma Forma**

```
class Heroe : public Personaje {
    // ¡Habilidades especiales implementadas!
    void ataqueValiente(Enemigo& objetivo);
    void gritoInspirador();
    // + Sistema de coraje único
};
```

**3. Combate Básico Funcionando**

* Menú de combate con ataque, objetos y huida
* Inventario con pociones que se consumen correctamente
* Sistema de turnos con AI enemiga

### 🐛 Batallas con Bugs

**El Problema del Inventario Fantasma**\
Encontramos (y solucionamos) un bug donde las pociones se consumían doblemente. Resulta que tanto `Inventario` como `Pocion` intentaban restar cantidades. ¡Un poco de debugging con `[DEBUG]` salvó el día!

**Unicode vs MSYS2**\
Los caracteres en español se mostraban como jeroglíficos. Después de probar `SetConsoleOutputCP(CP_UTF8)` y varias configuraciones regionales, decidí que por ahora los acentos pueden esperar.

### 🎯 Próximos Pasos

Mañana (o cuando pueda):

* Crear las clases `Guerrero`, `Mago` y `Arquero`
* Implementar sistema de magia en combate
* Balancear stats (el pobre Goblin casi no hace daño)

### 💡 Aprendizaje del Día

**C++ es sorprendentemente portable:** Compilé una vez y el .exe funcionó inmediatamente en otra máquina. Cero dependencias, cero instaladores. Hay belleza en la simplicidad.

**La herencia es poderosa:** Poder extender `Personaje` a `Heroe` con habilidades únicas sin tocar el código base... eso es elegancia en código.

- - -

*¿Has trabajado con sistemas de herencia en C++? ¿Algún consejo para el balance de stats en RPGs? ¡Los leo en los comentarios!*

<!--EndFragment-->
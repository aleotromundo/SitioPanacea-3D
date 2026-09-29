# Guía para editar el entorno 3D de Proyectos

## Archivos principales

La escena de **Proyectos** se controla principalmente desde:

- `sources/Game/World/Areas/ProjectsArea.js`: crea los objetos decorativos, busca los nodos del GLB, ubica imágenes/carteles y actualiza textos.
- `sources/data/projects.js`: contiene los datos de cada proyecto, incluidos título, URL, imágenes y valores de `role`/`with`.
- `sources/Game/TextCanvas.js`: dibuja textos en un canvas y los convierte en texturas para las superficies 3D.
- `static/areas/areas.glb`: modelo 3D exportado desde Blender. Contiene las mesas, columnas, carteles, referencias y geometría del entorno.

## Cambiar la posición de un objeto creado por código

En `ProjectsArea.js`, el método `setProjectObjects()` crea tres objetos decorativos:

```js
const succulent = new THREE.Group()
const computer = new THREE.Group()
const digital = new THREE.Group()
```

Después se agregan a la escena en el bloque que recorre `this.projectObjects`. Las posiciones son **locales al nodo `projects`** del GLB y se expresan como:

```js
object.position.x += ...
object.position.y += ...
object.position.z += ...
```

- `x`: izquierda/derecha.
- `y`: abajo/arriba.
- `z`: profundidad.
- `object.rotation`: orientación.
- `object.scale`: tamaño.

La maceta/suculenta es el objeto con índice `0`. Ahora se coloca usando la referencia `mainTablePhysicalDynamic`, que pertenece a la mesa del frente:

```js
object.position.copy(displayTable.position)
object.position.x += 0.2
object.position.y += 0.85
object.position.z += 0.05
```

Para ajustar manualmente la maceta:

- subirla: aumentar `0.85` en `y`;
- moverla a la derecha: aumentar `0.2` en `x`;
- moverla hacia el fondo o hacia adelante: modificar `0.05` en `z`;
- girarla: cambiar `object.rotation.set(...)`;
- agrandarla o achicarla: modificar `object.scale.setScalar(0.58)`.

El valor `0.85` está calculado para que la base de la maceta coincida aproximadamente con la superficie de la mesa. Conviene cambiarlo de a poco, por ejemplo `0.05` por vez.

## Mover la columna/cartel de atributos

El conjunto de carteles de atributos se obtiene en `setAttributes()`:

```js
this.attributes.group = this.references.items.get('attributes')[0]
```

El desplazamiento actual hacia la cámara está en:

```js
this.attributes.group.position.z += 0.5
```

Para acercarlo más, aumentar `0.5`. Para devolverlo, reducirlo o usar un valor negativo. Este grupo contiene los carteles `role`, `at` y `with`.

## Traducir los encabezados

Los nombres internos del modelo siguen siendo `role`, `at` y `with` porque son los nombres de los nodos dentro del GLB. Eso no obliga a que el texto visible esté en inglés.

La traducción visible se define en `setAttributes()`:

```js
this.attributes.labels = { role: 'ROL', at: 'EN', with: 'CON' }
```

Si querés otros textos, modificá solamente ese objeto. Por ejemplo:

```js
this.attributes.labels = { role: 'FUNCIÓN', at: 'EN', with: 'CON' }
```

La función reemplaza los planos cortos de los encabezados con `TextCanvas`, sin tener que editar y volver a exportar el archivo Blender/GLB.

Los valores largos de cada proyecto se siguen cambiando en `sources/data/projects.js`:

```js
attributes: {
    role: 'suculentas y productos botánicos',
    with: 'OtroMundo'
}
```

## Cambiar la posición de un objeto que ya está dentro del GLB

Si querés mover una mesa, columna u objeto que no fue creado por código:

1. Abrí el archivo `static/areas/areas.glb` en Blender.
2. Buscá el objeto dentro de la colección/área `projects`.
3. Cambiá su posición, rotación o escala.
4. Exportá nuevamente el GLB conservando los nombres de los nodos.
5. Reemplazá `static/areas/areas.glb`.

Los nombres importantes que se usan desde JavaScript incluyen:

- `projects`: raíz del área.
- `mainTablePhysicalDynamic`: referencia de la mesa donde se apoya la maceta.
- `refImages`: pantalla de imágenes.
- `refAttributes`: conjunto de carteles de atributos.
- `role`, `at`, `with`: carteles internos de atributos.

Si cambiás esos nombres en Blender, el código puede dejar de encontrar los objetos.

## Flujo de prueba

Desde la raíz del repositorio:

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

Para validar antes de subir cambios:

```bash
node --check sources/Game/World/Areas/ProjectsArea.js
pnpm run build
```

Los cambios de posiciones creados por código no requieren tocar el GLB ni Blender. Sólo hace falta editar `ProjectsArea.js`, guardar, recargar la experiencia y ajustar los valores poco a poco.

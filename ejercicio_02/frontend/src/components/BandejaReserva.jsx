import { ListGroup, ListGroupItem, ButtonGroup, Button } from 'reactstrap';

// Carrito lateral. No llama a la API directamente: recibe funciones por props
// y solo se encarga de DIBUJAR la lista y avisar cuando el usuario hace clic.
function BandejaReserva({ items, menu, onCambiarPorciones, onEliminar, cargando }) {
  return (
    <>
      <h3 className="mb-3">Tu Bandeja de Reserva</h3>

      {items.length === 0 ? (
        <p className="text-muted">Aún no has añadido platos a tu reserva.</p>
      ) : (
        <ListGroup>
          {items.map((item) => {
            // El backend solo guarda { id, cantidad }; el nombre y precio los buscamos en el menú
            const plato = menu.find((p) => p.id === item.id);
            if (!plato) return null;

            return (
              <ListGroupItem key={item.id}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{plato.nombre}</strong>
                    <div className="text-muted small">
                      ${plato.precio.toFixed(2)} c/u · Subtotal: $
                      {(plato.precio * item.cantidad).toFixed(2)}
                    </div>
                  </div>

                  {/* Endpoint 5: eliminar */}
                  <Button
                    color="danger"
                    outline
                    size="sm"
                    disabled={cargando}
                    onClick={() => onEliminar(item.id)}
                  >
                    Quitar
                  </Button>
                </div>

                {/* Endpoint 4: subir / bajar porciones */}
                <ButtonGroup size="sm" className="mt-2">
                  <Button
                    outline
                    color="secondary"
                    disabled={cargando || item.cantidad <= 1}
                    onClick={() => onCambiarPorciones(item.id, item.cantidad - 1)}
                  >
                    −
                  </Button>
                  <Button outline color="secondary" disabled>
                    {item.cantidad}
                  </Button>
                  <Button
                    outline
                    color="secondary"
                    disabled={cargando}
                    onClick={() => onCambiarPorciones(item.id, item.cantidad + 1)}
                  >
                    +
                  </Button>
                </ButtonGroup>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      )}
    </>
  );
}

export default BandejaReserva;
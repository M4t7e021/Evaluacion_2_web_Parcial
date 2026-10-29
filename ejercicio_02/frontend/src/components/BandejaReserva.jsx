import { ListGroup, ListGroupItem, ButtonGroup, Button } from 'reactstrap';

// Carrito lateral. No llama a la API directamente: recibe funciones por props
// y solo se encarga de DIBUJAR la lista y avisar cuando el usuario hace clic.
// Visualmente es un "ticket" de comedor: nombre ........ subtotal.
function BandejaReserva({ items, menu, onCambiarPorciones, onEliminar, cargando }) {
  // El backend solo guarda { id, cantidad }; el nombre y precio los buscamos en el menú
  const total = items.reduce((acum, item) => {
    const plato = menu.find((p) => p.id === item.id);
    return acum + (plato ? plato.precio * item.cantidad : 0);
  }, 0);

  return (
    <div className="ticket">
      <h3 className="ticket__titulo">Tu Bandeja de Reserva</h3>

      {items.length === 0 ? (
        <p className="ticket__vacio">🍽️ Aún no has añadido platos a tu reserva.</p>
      ) : (
        <>
          <ListGroup flush>
            {items.map((item) => {
              const plato = menu.find((p) => p.id === item.id);
              if (!plato) return null;

              return (
                <ListGroupItem key={item.id} className="ticket__item">
                  <div className="ticket__linea">
                    <strong>{plato.nombre}</strong>
                    <span className="ticket__puntos" aria-hidden="true" />
                    <span className="ticket__monto">
                      ${(plato.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-muted small">${plato.precio.toFixed(2)} c/u</div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    {/* Endpoint 4: subir / bajar porciones */}
                    <ButtonGroup size="sm">
                      <Button
                        outline
                        color="secondary"
                        disabled={cargando || item.cantidad <= 1}
                        onClick={() => onCambiarPorciones(item.id, item.cantidad - 1)}
                        aria-label={`Quitar una porción de ${plato.nombre}`}
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
                        aria-label={`Añadir una porción de ${plato.nombre}`}
                      >
                        +
                      </Button>
                    </ButtonGroup>

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
                </ListGroupItem>
              );
            })}
          </ListGroup>

          <div className="ticket__total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </>
      )}
    </div>
  );
}

export default BandejaReserva;

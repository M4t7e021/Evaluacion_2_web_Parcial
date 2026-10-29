import { Row, Col, Card, CardBody, CardTitle, CardSubtitle, Badge, Button } from 'reactstrap';

// Un emoji por categoría para dar identidad visual a cada tarjeta
const EMOJI_CATEGORIA = { Fuerte: '🍗', Entrada: '🥣', Saludable: '🥗' };

// Cuadrícula del menú del día. Cada plato es una Card; el botón se desactiva si no hay stock.
function MenuDelDia({ menu, onAgregar, cargando }) {
  return (
    <Row>
      {menu.map((plato) => {
        const agotado = plato.stock === 0;
        const pocoStock = plato.stock > 0 && plato.stock <= 3;
        const categoria = plato.categoria.toLowerCase();

        return (
          <Col md="4" xs="12" key={plato.id}>
            <Card className={`fd-card mb-3 h-100 ${agotado ? 'fd-card--agotado' : ''}`}>
              <div className={`fd-card__img fd-cat-${categoria}`} aria-hidden="true">
                {EMOJI_CATEGORIA[plato.categoria] || '🍽️'}
              </div>
              <CardBody className="d-flex flex-column">
                <CardSubtitle className="fd-card__categoria">{plato.categoria}</CardSubtitle>
                <CardTitle tag="h5" className="fd-card__titulo">{plato.nombre}</CardTitle>
                <div className="mb-2">
                  <Badge color="success" className="fd-precio">
                    ${plato.precio.toFixed(2)}
                  </Badge>
                </div>
                <p className={`fd-stock mb-3 ${pocoStock ? 'fd-stock--poco' : ''}`}>
                  Stock disponible: <strong>{plato.stock}</strong>
                  {pocoStock && ' · ¡últimas porciones!'}
                </p>
                <Button
                  className="mt-auto"
                  color={agotado ? 'secondary' : 'primary'}
                  disabled={agotado || cargando}
                  onClick={() => onAgregar(plato.id)}
                >
                  {agotado ? 'Agotado' : 'Añadir a la Reserva'}
                </Button>
              </CardBody>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default MenuDelDia;

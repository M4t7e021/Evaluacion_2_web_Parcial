import { Navbar, NavbarBrand, Alert, Badge, Progress } from 'reactstrap';

// Panel fijo: muestra el saldo del usuario y el total de la reserva.
// La barra delgada inferior indica qué parte del saldo ya se ha comprometido.
function PanelSuperior({ saldo, total }) {
  const porcentaje = saldo > 0 ? Math.min(100, (total / saldo) * 100) : 0;
  const casiLleno = porcentaje >= 85;

  return (
    <Navbar dark fixed="top" className="fd-nav px-3">
      <NavbarBrand className="fd-brand">🍽️ Food DEI</NavbarBrand>
      <div className="fd-nav__datos">
        <Alert color="info" className="fd-saldo mb-0">
          Tu saldo actual: <strong>${saldo.toFixed(2)}</strong>
        </Alert>
        <span className="fd-nav__total">
          Total de tu Reserva:{' '}
          <Badge color="light" className="fd-total" pill>
            ${total.toFixed(2)}
          </Badge>
        </span>
      </div>
      <Progress
        value={porcentaje}
        className={`fd-presupuesto ${casiLleno ? 'fd-presupuesto--lleno' : ''}`}
        aria-label="Porcentaje del saldo utilizado"
      />
    </Navbar>
  );
}

export default PanelSuperior;

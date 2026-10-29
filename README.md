# Evaluación II - Programación Web (UCA)

Dos aplicaciones independientes, cada una con `backend` (Express) y `frontend` (Vite + React).

| Ejercicio | Descripción | Backend | Frontend |
|---|---|---|---|
| `ejercicio_01` | Adivina el Número | `http://localhost:4000` | `http://localhost:5173` |
| `ejercicio_02` | Food DEI (reservas) | `http://localhost:4000` | `http://localhost:5173` |

> Ambos backends usan el puerto 4000: **ejecuta un ejercicio a la vez**, o cambia `PORT` en el `.env` del backend
> y crea un `.env` en el frontend con `VITE_API_URL=http://localhost:<PUERTO>`.

## Cómo ejecutar (repetir para cada ejercicio)

```bash
# Terminal 1 - backend
cd ejercicio_0X/backend
npm install
npm run dev

# Terminal 2 - frontend
cd ejercicio_0X/frontend
npm install
npm run dev
```

Luego abrir la URL que muestre Vite.

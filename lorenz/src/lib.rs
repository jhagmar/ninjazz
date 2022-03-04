mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

type Float = f64;

type Time = f64;

#[wasm_bindgen]
struct LorenzAttractor {
    sigma: f64,
    beta: f64,
    rho: f64,
    x: Float,
    y: Float,
    z: Float,
}

#[wasm_bindgen]
struct LorenzState {
    pub x: Float,
    pub y: Float,
    pub z: Float,
}

#[wasm_bindgen]
impl LorenzAttractor {
    pub fn new() -> Self {
        Self {
            sigma: 10.,
            beta: 8. / 3.,
            rho: 28.,
            x: 3.462752531439218,
            y: 0.9197550252985796,
            z: 25.515757482215403,
        }
    }

    pub fn next(&mut self, mut dt: Time) -> LorenzState {
        
        while dt > 0. {
            let d = {if dt > 1e-3 { 1e-3 } else { dt }};
            let dx = self.sigma * (self.y - self.x);
            let dy = self.x * (self.rho - self.z) - self.y;
            let dz = self.x * self.y - self.beta * self.z;

            self.x = self.x + dx * d;
            self.y = self.y + dy * d;
            self.z = self.z + dz * d;

            dt = dt - d;
        }

        LorenzState { x: self.x, y: self.y, z: self.z }
        
    }
}

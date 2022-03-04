//#include <emscripten/bind.h>
#include <emscripten.h>

#include <array>
#include <cmath>
#include <numbers>
#include <vector>

#include <iostream>

namespace
{

  using ElementType = double;

  constexpr size_t N_BUFFERS = 3;
  constexpr ElementType PERTURBATION_RADIUS = 0.1;
  constexpr ElementType PERTURBATION_DEPTH = 0.05;
  constexpr ElementType PI = 3.14159265358979;
}

// Class to perform discretized wave equation simulation
class WaveSimulation
{

public:
  WaveSimulation(size_t const nX, size_t const nY, ElementType const dX, ElementType const dY, ElementType c)
      : nX{nX}, nY{nY}, dX{dX}, dY{dY}, c{c}, currentIndex{0}
  {
    initializeBuffers();
  }

  double *nextFrame(ElementType const dT)
  {
    size_t const prevIndex = (currentIndex - 1 + N_BUFFERS) % N_BUFFERS;
    size_t const nextIndex = (currentIndex + 1) % N_BUFFERS;
    ElementType *const prevBuffer = buffers[prevIndex].data();
    ElementType *const currentBuffer = buffers[currentIndex].data();
    ElementType *const nextBuffer = buffers[nextIndex].data();
    computeNextFrame(prevBuffer + nX, currentBuffer + nX, nextBuffer + nX, dT, nY - 2);
    currentIndex = nextIndex;
    return nextBuffer;
  }

  void perturb(ElementType const x, ElementType const y) {
    ElementType *const currentBuffer = buffers[currentIndex].data();
    perturbChunk(x, y, currentBuffer, 1, nY - 1);
  }

private:
  // Get size of element
  static size_t constexpr elementSize()
  {
    return sizeof(ElementType);
  }

  // Get the size of a frame in bytes
  static size_t frameSize(size_t const nX, size_t const nY)
  {
    return nX * nY * elementSize();
  }

  // Initialize for first use
  void initializeBuffers()
  {
    auto const fs = frameSize(nX, nY);
    for (auto &b : buffers)
    {
      b.resize(fs);
      std::fill(b.begin(), b.end(), static_cast<ElementType>(0));
    }
  }

  void computeNextFrame(ElementType const *const prevBuffer, ElementType const *const currentBuffer, ElementType *const nextBuffer, ElementType const dT, size_t const N)
  {
    // Pointers to current element
    ElementType const *pc = prevBuffer + 1;
    ElementType const *cc = currentBuffer + 1;
    ElementType *nc = nextBuffer + 1;

    size_t const M = nX - 2;
    ElementType const C = c * c * dT * dT;
    ElementType const dX2 = dX * dX;
    ElementType const dY2 = dY * dY;

    for (size_t y = 0; y < N; y++)
    {
      // Pointers to north, east, south, west elements
      ElementType const *cn = cc - nX;
      ElementType const *ce = cc + 1;
      ElementType const *cs = cc + nX;
      ElementType const *cw = cc - 1;

      // Saved pointers to first element to compute on row
      ElementType const *spc = pc;
      ElementType const *scc = cc;
      ElementType *snc = nc;

      for (size_t x = 0; x < M; x++)
      {
        *nc = 0.99 * (2 * *cc - *pc + C * ((*ce - 2 * *cc + *cw) / dX2 + (*cs - 2 * *cc + *cn) / dY2));

        pc++;
        cc++;
        nc++;
        cn++;
        ce++;
        cs++;
        cw++;
      }

      // Advance current pointers to next row
      pc = spc + nX;
      cc = scc + nX;
      nc = snc + nX;
    }
  }

  void perturbChunk(ElementType const perturbationX, ElementType const perturbationY, ElementType * const currentBuffer, size_t const fromY, size_t const toY) {
    ElementType *c = currentBuffer + fromY * nX + 1;

    for (size_t i = fromY; i < toY; i++) {
      ElementType * const sc = c;

      ElementType const y = i * dY;
      ElementType const dy = y - perturbationY;

      for (size_t j = 1; j < nX - 1; j++) {

        ElementType const x = j * dX;
        ElementType const dx = x - perturbationX;

        ElementType const relativeDist = sqrt(dx * dx + dy * dy) / PERTURBATION_RADIUS;
        if (relativeDist < (ElementType)1.0) {
          ElementType const perturbation =  -PERTURBATION_DEPTH * ((ElementType)1.0 + cos(PI * relativeDist)/(ElementType)2.0);
          *c = perturbation;
        }
        

        c++;

      }

      c = sc + nX;

    }
  }

  size_t nX;
  size_t nY;
  ElementType dX;
  ElementType dY;
  ElementType c;

  std::array<std::vector<ElementType>, N_BUFFERS> buffers;
  size_t currentIndex;
};

extern "C"
{

  EMSCRIPTEN_KEEPALIVE
  WaveSimulation *init(size_t const nX, size_t const nY, ElementType const dX, ElementType const dY, ElementType c)
  {
    return new WaveSimulation(nX, nY, dX, dY, c);
  }

  EMSCRIPTEN_KEEPALIVE
  ElementType *next(WaveSimulation *ctx, ElementType const dT)
  {
    return ((WaveSimulation *)ctx)->nextFrame(dT);
  }

  EMSCRIPTEN_KEEPALIVE
  void perturb(WaveSimulation *ctx, ElementType const x, ElementType const y)
  {
    ((WaveSimulation *)ctx)->perturb(x, y);
  }

  EMSCRIPTEN_KEEPALIVE
  void destroy(WaveSimulation *ctx)
  {
    delete ctx;
  }
}

/*using namespace emscripten;

static float buffer[5] = {0, 1, 2, 3, 4};

float *lerp() {
    return buffer;
}

EMSCRIPTEN_BINDINGS(my_module) {
    function("lerp", &lerp, allow_raw_pointers());
}*/

import * as THREE from 'three';

/**
 * A slowly rotating ring of photographs, drawn with WebGL.
 *
 * This module is the only place three.js is imported, and it is loaded with a
 * dynamic import so the ~600KB never reaches visitors who don't scroll to the
 * showcase. Keep it that way: importing this from a page would pull three.js
 * into the main bundle.
 */

const PLANE_WIDTH = 3;
const PLANE_HEIGHT = 2;
/** Horizontal gap between photos, as a fraction of a photo's width. */
const GAP_RATIO = 1.35;
const AUTO_SPIN = 0.0012;
/** How quickly a flick decays back to the gentle idle spin. */
const DRAG_DECAY = 0.94;

export interface PraiseCarousel {
  dispose(): void;
}

/** Cheap capability probe — some devices expose WebGL but fail to create a context. */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function createPraiseCarousel(
  container: HTMLElement,
  urls: readonly string[],
  options: { autoSpin?: boolean } = {}
): PraiseCarousel {
  const autoSpin = options.autoSpin !== false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Capping DPR keeps mid-range phones smooth; beyond 2 the gain is invisible.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.touchAction = 'pan-y';
  renderer.domElement.style.cursor = 'grab';

  const ring = new THREE.Group();
  scene.add(ring);

  // Radius that spaces `count` photos evenly around the ring without overlap.
  const count = Math.max(urls.length, 1);
  const radius = Math.max(3.2, (count * PLANE_WIDTH * GAP_RATIO) / (2 * Math.PI));
  // Sit just outside the ring so the front photo dominates the frame. A fixed
  // offset (rather than a multiple of the radius) keeps the framing consistent
  // whether the album holds five photos or twelve.
  camera.position.set(0, 0.3, radius + 2.6);
  camera.lookAt(0, 0, 0);

  const loader = new THREE.TextureLoader();
  const textures: THREE.Texture[] = [];
  const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT);
  const materials: THREE.Material[] = [];

  urls.forEach((url, index) => {
    const angle = (index / count) * Math.PI * 2;
    // Starts as a dark panel and brightens to white once its texture arrives,
    // so a slow connection shows an empty frame rather than a tinted photo.
    const material = new THREE.MeshBasicMaterial({
      color: 0x2a2a2a,
      side: THREE.DoubleSide,
    });
    materials.push(material);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
    // Face outward, so each photo looks at the camera as it comes around.
    mesh.rotation.y = angle;
    ring.add(mesh);

    loader.load(
      url,
      texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        textures.push(texture);
        material.map = texture;
        material.color.set(0xffffff);
        material.needsUpdate = true;
      },
      undefined,
      () => {
        // A photo that fails to load simply stays a dark panel.
      }
    );
  });

  let velocity = 0;
  let dragging = false;
  let lastX = 0;

  function onPointerDown(e: PointerEvent) {
    dragging = true;
    lastX = e.clientX;
    renderer.domElement.style.cursor = 'grabbing';
    renderer.domElement.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    const delta = e.clientX - lastX;
    lastX = e.clientX;
    velocity = delta * 0.0035;
    ring.rotation.y += velocity;
  }

  function onPointerUp(e: PointerEvent) {
    dragging = false;
    renderer.domElement.style.cursor = 'grab';
    if (renderer.domElement.hasPointerCapture(e.pointerId)) {
      renderer.domElement.releasePointerCapture(e.pointerId);
    }
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerUp);

  function resize() {
    const { clientWidth, clientHeight } = container;
    if (clientWidth === 0 || clientHeight === 0) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  renderer.setAnimationLoop(() => {
    if (!dragging) {
      if (Math.abs(velocity) > 0.0001) {
        ring.rotation.y += velocity;
        velocity *= DRAG_DECAY;
      } else if (autoSpin) {
        ring.rotation.y += AUTO_SPIN;
      }
    }
    renderer.render(scene, camera);
  });

  return {
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);

      // GPU resources are not garbage collected — release them explicitly.
      geometry.dispose();
      materials.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

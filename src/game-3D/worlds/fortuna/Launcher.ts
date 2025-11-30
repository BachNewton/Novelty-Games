import * as THREE from 'three';

export function createLauncher(scene: THREE.Scene, position: THREE.Vector3) {
    // Launcher visual (wooden stick/channel on right side)
    const launcherGeometry = new THREE.BoxGeometry(0.2, 0.15, 1.5);
    const launcherMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown wood
    const launcher = new THREE.Mesh(launcherGeometry, launcherMaterial);
    launcher.position.copy(position);
    launcher.rotation.z = Math.PI / 6; // Angle the launcher
    scene.add(launcher);

    // Launcher channel/guide
    const channelGeometry = new THREE.BoxGeometry(0.3, 0.05, 1.5);
    const channelMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 }); // Darker brown
    const channel = new THREE.Mesh(channelGeometry, channelMaterial);
    channel.position.copy(position);
    channel.position.y -= 0.1;
    channel.rotation.z = Math.PI / 6;
    scene.add(channel);
}


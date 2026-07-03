#include <stdio.h>

int main() {
    float side;
    printf("Perimeter of a Square\n");
    printf("Enter side length: ");
    scanf("%f", &side);
    if (side < 0) {
        printf("Side cannot be negative.\n");
        return 1;
    }
    printf("Perimeter = %.2f\n", 4 * side);
    return 0;
}
